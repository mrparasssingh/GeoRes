"""Localhost API Backend for GeoRes Super-Resolution Model.

Connects the React/Vite frontend (TeraSharp model UI) directly to the
trained PyTorch SRCNN super-resolution model on localhost:8000.

Features:
  - CORS support for http://localhost:5173 (Vite dev server)
  - POST /api/enhance: Ingests uploaded satellite tile, runs PyTorch SRCNN
  - GET /api/jobs/<job_id>: Returns job status and processing steps
  - GET /api/results/<job_id>: Retrieves enhancement metadata & URLs
  - GET /static/<filename>: Serves original and enhanced images
  - GET /health: Health check and GPU acceleration diagnostics
"""

import argparse
import email
from email.policy import default
import io
import json
import os
import sys
import time
import uuid
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from typing import Dict, Any, Optional
from urllib.parse import urlparse, parse_qs, unquote

# Ensure project root is in python path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from PIL import Image
import numpy as np
import torch
from torch.amp import autocast

# pyrefly: ignore [missing-import]
from src.model import build_srcnn, get_device

# Directories
STATIC_DIR = ROOT_DIR / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)
CHECKPOINT_PATH = ROOT_DIR / "checkpoints" / "srcnn_best.pth"

# Server limits
MAX_UPLOAD_BYTES = 100 * 1024 * 1024  # 100 MB — matches frontend cap
MAX_IMAGE_DIM = 4096  # Reject inputs with either axis > 4096px to prevent GPU OOM
MAX_JOBS = 200  # Maximum jobs to keep in memory before evicting oldest
JOB_TTL_SECONDS = 3600  # Jobs older than 1 hour are evicted on next request

# CORS — restrict to the Vite dev server origin
ALLOWED_ORIGIN = "http://localhost:5173"

# In-memory store for enhancement jobs
JOBS: Dict[str, Dict[str, Any]] = {}

# Global model cache to avoid re-loading on each request
_MODEL = None
_DEVICE = None


def load_model():
    """Loads and caches the trained SRCNN model onto the active compute device."""
    global _MODEL, _DEVICE
    if _MODEL is None:
        _DEVICE = get_device(verbose=True)
        _MODEL = build_srcnn(device=_DEVICE)
        if CHECKPOINT_PATH.is_file():
            _MODEL.load_state_dict(
                torch.load(str(CHECKPOINT_PATH), map_location=_DEVICE, weights_only=True)
            )
            print(f"[Backend] Loaded trained SRCNN weights from {CHECKPOINT_PATH}")
        else:
            print(f"[Backend] WARNING: Checkpoint not found at {CHECKPOINT_PATH}; using unweighted model.")
        _MODEL.eval()
    return _MODEL, _DEVICE


def _evict_stale_jobs():
    """Remove jobs older than JOB_TTL_SECONDS and enforce MAX_JOBS cap."""
    now = time.time()
    # Evict by TTL
    expired = [jid for jid, j in JOBS.items() if now - j.get("_created_at", now) > JOB_TTL_SECONDS]
    for jid in expired:
        JOBS.pop(jid, None)
    # Evict oldest if over cap
    while len(JOBS) > MAX_JOBS:
        oldest_id = next(iter(JOBS))
        JOBS.pop(oldest_id, None)


def run_super_resolution(img: Image.Image, scale: int = 2) -> Image.Image:
    """Applies bicubic upsampling followed by SRCNN refinement.

    Raises ValueError if the input image exceeds MAX_IMAGE_DIM on either axis.
    """
    model, device = load_model()

    orig_w, orig_h = img.size
    if orig_w > MAX_IMAGE_DIM or orig_h > MAX_IMAGE_DIM:
        raise ValueError(
            f"Image dimensions {orig_w}×{orig_h} exceed maximum {MAX_IMAGE_DIM}px. "
            f"Please resize before uploading."
        )

    # Upscale input via bicubic first
    target_w, target_h = orig_w * scale, orig_h * scale
    upscaled = img.resize((target_w, target_h), Image.BICUBIC)

    # Convert to tensor (1, 3, H, W) in [0, 1]
    inp = torch.from_numpy(np.array(upscaled)).permute(2, 0, 1).float().unsqueeze(0) / 255.0
    inp = inp.to(device)

    # SRCNN inference
    with torch.no_grad():
        if device.type == "cuda":
            with autocast("cuda"):
                out = model(inp)
        else:
            out = model(inp)

    # Post-process back to PIL Image
    out = out.clamp(0, 1).squeeze(0).permute(1, 2, 0).cpu().numpy()
    enhanced_pil = Image.fromarray((out * 255).astype(np.uint8))
    return enhanced_pil


class GeoResAPIHandler(BaseHTTPRequestHandler):
    """HTTP Request Handler providing REST API for GeoRes Super-Resolution."""

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Expose-Headers", "Content-Disposition, Content-Length")

    def do_OPTIONS(self):
        """Respond to preflight CORS requests."""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path in ("/health", "/api/health"):
            _, device = load_model()
            payload = {
                "status": "healthy",
                "model": "SRCNN",
                "device": str(device),
                "vram_allocated_mb": round(torch.cuda.memory_allocated(device) / (1024 ** 2), 2) if device.type == "cuda" else 0,
            }
            self._send_json(200, payload)

        elif path.startswith("/api/jobs/"):
            job_id = path.replace("/api/jobs/", "").strip("/")
            job = JOBS.get(job_id)
            if job:
                self._send_json(200, job)
            else:
                self._send_json(404, {"error": f"Job {job_id} not found"})

        elif path.startswith("/api/results/"):
            job_id = path.replace("/api/results/", "").strip("/")
            job = JOBS.get(job_id)
            if job:
                self._send_json(200, job)
            else:
                self._send_json(404, {"error": f"Result for {job_id} not found"})

        elif path.startswith("/api/download/"):
            # Dedicated attachment download route for PNG or GeoTIFF
            job_id = path.replace("/api/download/", "").strip("/")
            job = JOBS.get(job_id)
            if not job:
                self._send_json(404, {"error": f"Job {job_id} not found"})
                return

            query_params = parse_qs(parsed.query)
            fmt = query_params.get("format", ["png"])[0].lower()
            base_name = Path(job.get("filename", "satellite")).stem

            if fmt in ("geotiff", "tif", "tiff"):
                target_filename = job.get("enhancedTifFilename")
                download_name = f"{base_name}_enhanced_4x.tif"
                mime_type = "image/tiff"
            else:
                target_filename = job.get("enhancedPngFilename")
                download_name = f"{base_name}_enhanced_4x.png"
                mime_type = "image/png"

            if not target_filename:
                self._send_json(404, {"error": f"Requested format '{fmt}' not available for job {job_id}"})
                return

            file_path = STATIC_DIR / target_filename
            if not file_path.is_file():
                self._send_json(404, {"error": "Target download file not found on disk"})
                return

            self.send_response(200)
            self._set_cors_headers()
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Disposition", f'attachment; filename="{download_name}"')
            self.send_header("Content-Length", str(file_path.stat().st_size))
            self.end_headers()
            with open(file_path, "rb") as f:
                self.wfile.write(f.read())

        elif path.startswith("/static/"):
            filename = unquote(path.replace("/static/", ""))
            safe_filename = os.path.basename(filename)
            file_path = STATIC_DIR / safe_filename
            if file_path.is_file():
                ext = file_path.suffix.lower()
                if ext == ".png":
                    mime = "image/png"
                elif ext in (".tif", ".tiff"):
                    mime = "image/tiff"
                else:
                    mime = "image/jpeg"
                self.send_response(200)
                self._set_cors_headers()
                self.send_header("Content-Type", mime)
                self.send_header("Content-Length", str(file_path.stat().st_size))

                # If download query param provided, attach disposition header
                query_params = parse_qs(parsed.query)
                if "download" in query_params:
                    self.send_header("Content-Disposition", f'attachment; filename="{safe_filename}"')

                self.end_headers()
                with open(file_path, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self._send_json(404, {"error": "File not found"})

        else:
            self._send_json(404, {"error": "Endpoint not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/enhance":
            try:
                content_type = self.headers.get("Content-Type", "")
                content_length = int(self.headers.get("Content-Length", 0))

                # C2: Reject uploads exceeding size limit
                if content_length > MAX_UPLOAD_BYTES:
                    self._send_json(413, {"detail": f"Upload too large ({content_length} bytes). Max is {MAX_UPLOAD_BYTES // (1024*1024)} MB."})
                    return

                body_bytes = self.rfile.read(content_length)

                file_bytes: Optional[bytes] = None
                filename = "uploaded_satellite.png"
                scale_val = 4  # Default to 4x matching UI

                if "multipart/form-data" in content_type:
                    # Modern standard library multipart parsing
                    header_bytes = f"Content-Type: {content_type}\r\n\r\n".encode("latin1")
                    msg = email.message_from_bytes(header_bytes + body_bytes, policy=default)
                    for part in msg.iter_parts():
                        name = part.get_param("name", header="Content-Disposition")
                        if name == "file":
                            filename = part.get_filename() or "uploaded_satellite.png"
                            file_bytes = part.get_payload(decode=True)
                        elif name == "scale":
                            raw_scale = part.get_payload(decode=True)
                            if raw_scale:
                                try:
                                    scale_val = int(raw_scale.decode("utf-8").strip())
                                except (ValueError, UnicodeDecodeError):
                                    pass
                else:
                    # Raw image payload
                    file_bytes = body_bytes

                if not file_bytes:
                    self._send_json(400, {"detail": "No image file received"})
                    return

                input_img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
                job_id = f"job-{uuid.uuid4().hex[:8]}"
                safe_name = os.path.basename(filename)
                stem = Path(safe_name).stem

                # Save original image for before/after comparison
                orig_filename = f"orig_{job_id}_{safe_name}"
                orig_path = STATIC_DIR / orig_filename
                input_img.save(orig_path)

                start_time = time.time()
                # Run PyTorch SRCNN super-resolution (validates dimensions inside)
                enhanced_img = run_super_resolution(input_img, scale=scale_val)
                latency_ms = round((time.time() - start_time) * 1000, 2)

                # Save enhanced PNG
                enh_png_filename = f"enh_{job_id}_{stem}.png"
                enh_png_path = STATIC_DIR / enh_png_filename
                enhanced_img.save(enh_png_path, format="PNG")

                # Save enhanced TIFF (plain TIFF via Pillow — no geospatial metadata)
                enh_tif_filename = f"enh_{job_id}_{stem}.tif"
                enh_tif_path = STATIC_DIR / enh_tif_filename
                enhanced_img.save(enh_tif_path, format="TIFF")

                # C1: Evict stale/old jobs before adding a new one
                _evict_stale_jobs()

                # Store job record with relative URLs for proxy compatibility (M3)
                JOBS[job_id] = {
                    "jobId": job_id,
                    "status": "complete",
                    "currentStep": 5,
                    "originalUrl": f"/static/{orig_filename}",
                    "enhancedUrl": f"/static/{enh_png_filename}",
                    "enhancedPngFilename": enh_png_filename,
                    "enhancedTifFilename": enh_tif_filename,
                    "downloadPngUrl": f"/api/download/{job_id}?format=png",
                    "downloadTifUrl": f"/api/download/{job_id}?format=geotiff",
                    "filename": safe_name,
                    "isDemo": False,
                    "scale": scale_val,
                    "latency_ms": latency_ms,
                    "model": "SRCNN",
                    "_created_at": time.time(),
                }

                print(f"[Backend] Processed job {job_id} ({safe_name}) in {latency_ms} ms on {_DEVICE} (saved PNG + TIFF)")
                self._send_json(200, {"jobId": job_id})

            except ValueError as e:
                # Dimension validation or image parsing errors
                print(f"[Backend WARN] {e}")
                self._send_json(400, {"detail": str(e)})
            except (OSError, RuntimeError) as e:
                # I/O errors, CUDA OOM, tensor errors
                print(f"[Backend ERROR] {e}")
                self._send_json(500, {"detail": "Enhancement failed. The image may be too large or corrupted."})
        else:
            self._send_json(404, {"error": "Endpoint not found"})

    def _send_json(self, status: int, data: Dict[str, Any]):
        response_bytes = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self._set_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)


def run_server(port: int = 8000):
    load_model()
    server_address = ("", port)
    httpd = ThreadingHTTPServer(server_address, GeoResAPIHandler)
    httpd.daemon_threads = True
    print(f"\n=======================================================")
    print(f" GeoRes SRCNN Super-Resolution Backend Live on Port {port}")
    print(f" Multithreaded server with PNG/TIFF download endpoints")
    print(f" Ready to accept enhancement requests from Vite frontend")
    print(f" Health check: http://localhost:{port}/health")
    print(f"=======================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping GeoRes server...")
        httpd.server_close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GeoRes PyTorch SRCNN REST Server")
    parser.add_argument("port_positional", nargs="?", type=int, default=None, help="Server port (positional)")
    parser.add_argument("--port", "-p", type=int, default=None, help="Server port")
    args = parser.parse_args()

    port = args.port or args.port_positional or 8000
    run_server(port)

