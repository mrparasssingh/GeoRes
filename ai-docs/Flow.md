# Execution Flow

How execution actually travels across files, functions, and modules.

## Current Flow (SRCNN Super-Resolution)
1. EuroSAT dataset (previously downloaded):
   - Data in `data/eurosat/Dataset/` — 27,000 flat files named `ClassName_NNN.jpg`, each 64×64 RGB.
2. Super-Resolution Pipeline Flow:
   - `src/dataset.py`: Scans `data/eurosat/Dataset/` via `os.walk`, builds `SRDataset`. Each 64×64 tile is the HR target; degraded input synthesized by downscaling by `scale` then bicubic upscaling back. Augmented via random flips/rotations (`augments_per_image=2`). Returns `(lr_tensor, hr_tensor)` pairs in `[0, 1]` float range (no ImageNet normalization).
   - `src/model.py`: Instantiates `SRCNN` — 3 Conv2d layers (3→64→32→3, kernels 9/5/5), ReLU after first two. No pooling, no linear layers. Output is same spatial size as input. `get_device()` with print-once caching preserved from old code.
   - `src/train.py`: Configures `L1Loss` (sharper than MSE), Adam optimizer, AMP (`GradScaler` + `autocast('cuda')`). Iterates training batches, logs L1 loss and VRAM usage. Saves best checkpoint by lowest loss to `checkpoints/srcnn_best.pth`, also saves `srcnn_last.pth`.
   - `src/evaluate.py`: Loads `checkpoints/srcnn_best.pth`, runs SRCNN on degraded eval pairs, computes average PSNR vs HR ground truth. Also computes bicubic baseline PSNR for comparison. Saves JSON report to `checkpoints/sr_evaluation_report.json`.
   - `src/predict.py`: Loads input image → upscales by `scale`× via bicubic → runs through SRCNN → clamps [0,1] → saves output PNG. Output is a saved image file with dimensions `(input_w × scale, input_h × scale)`.
   - `src/server.py`: Multi-threaded HTTP server (`ThreadingHTTPServer`) running on `localhost:8000`. Exposes `/api/enhance` (multipart file ingestion), `/api/jobs/<jobId>`, `/api/results/<jobId>`, and dedicated attachment download routes `/api/download/<jobId>?format=png` and `/api/download/<jobId>?format=geotiff`. Runs PyTorch SRCNN with CUDA acceleration, saves both high-resolution PNG and authentic GeoTIFF (.tif) outputs to `static/`, and attaches `Content-Disposition` headers for native browser file downloads.
   - `frontend/` (React + Vite): Runs on `localhost:5173`. Proxies `/api` and `/static` to backend port 8000 for same-origin security compliance. Interacts with `src/server.py` to provide interactive drag-and-drop upload, Leaflet GIS map preview, real-time before/after comparison slider, and 1-click downloads for PNG and GeoTIFF.

## Previous Flow (Classifier — REMOVED)
The old classification pipeline (ResNet-18, CrossEntropyLoss, 10-class EuroSAT labels) has been fully replaced. See `ai-docs/Decisions.md` entry for 2026-09-08.
