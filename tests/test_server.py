"""Integration and unit tests for GeoRes API server."""

import io
import json
import threading
import time
import urllib.request
import urllib.error
from http.server import ThreadingHTTPServer
from PIL import Image
import pytest

from src.server import (
    GeoResAPIHandler,
    run_super_resolution,
    _evict_stale_jobs,
    JOBS,
    MAX_IMAGE_DIM,
    MAX_JOBS,
    JOB_TTL_SECONDS,
    ALLOWED_ORIGIN,
)


def test_run_super_resolution_basic():
    """Verify run_super_resolution upscales PIL image by scale factor."""
    img = Image.new("RGB", (32, 32), color=(100, 150, 200))
    enhanced = run_super_resolution(img, scale=2)
    assert isinstance(enhanced, Image.Image)
    assert enhanced.size == (64, 64)


def test_run_super_resolution_dimension_guard():
    """Verify run_super_resolution raises ValueError if dimension exceeds MAX_IMAGE_DIM."""
    # Create image exceeding MAX_IMAGE_DIM
    # To avoid allocating a massive bitmap, mock the size property or use small allocation
    class FakeOversizedImage:
        size = (MAX_IMAGE_DIM + 10, 100)

    with pytest.raises(ValueError, match="exceed maximum"):
        run_super_resolution(FakeOversizedImage(), scale=2)


def test_evict_stale_jobs():
    """Verify _evict_stale_jobs evicts expired jobs and enforces MAX_JOBS cap."""
    JOBS.clear()
    now = time.time()

    # Add expired job
    JOBS["expired_job"] = {"jobId": "expired_job", "_created_at": now - JOB_TTL_SECONDS - 100}
    # Add fresh job
    JOBS["fresh_job"] = {"jobId": "fresh_job", "_created_at": now}

    _evict_stale_jobs()
    assert "expired_job" not in JOBS
    assert "fresh_job" in JOBS

    # Test MAX_JOBS cap
    JOBS.clear()
    for i in range(MAX_JOBS + 10):
        JOBS[f"job_{i}"] = {"jobId": f"job_{i}", "_created_at": now + i}

    _evict_stale_jobs()
    assert len(JOBS) <= MAX_JOBS


@pytest.fixture(scope="module")
def live_server():
    """Starts a ThreadingHTTPServer on an ephemeral port in a daemon thread."""
    server = ThreadingHTTPServer(("127.0.0.1", 0), GeoResAPIHandler)
    port = server.server_port
    base_url = f"http://127.0.0.1:{port}"

    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    time.sleep(0.1)

    yield base_url

    server.shutdown()
    server.server_close()


def test_api_health(live_server):
    """Verify /api/health responds with 200 OK and healthy status."""
    url = f"{live_server}/api/health"
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode("utf-8"))
        assert data.get("status") == "healthy"
        assert "device" in data
        assert data.get("model") == "SRCNN"


def test_api_options_cors(live_server):
    """Verify OPTIONS request returns restricted CORS origin header."""
    url = f"{live_server}/api/enhance"
    req = urllib.request.Request(url, method="OPTIONS")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        assert resp.headers.get("Access-Control-Allow-Origin") == ALLOWED_ORIGIN


def test_api_job_not_found(live_server):
    """Verify non-existent job ID returns 404."""
    url = f"{live_server}/api/jobs/invalid-job-id"
    with pytest.raises(urllib.error.HTTPError) as exc_info:
        urllib.request.urlopen(url)
    assert exc_info.value.code == 404


def test_api_enhance_and_download(live_server):
    """Verify /api/enhance with raw image payload processes and allows downloads."""
    # Create small 32x32 test image in memory
    buf = io.BytesIO()
    img = Image.new("RGB", (32, 32), color=(80, 120, 160))
    img.save(buf, format="PNG")
    raw_bytes = buf.getvalue()

    # POST to /api/enhance
    url = f"{live_server}/api/enhance"
    req = urllib.request.Request(
        url,
        data=raw_bytes,
        headers={"Content-Type": "image/png", "Content-Length": str(len(raw_bytes))},
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode("utf-8"))
        assert "jobId" in data
        job_id = data["jobId"]

    # Verify polling the job
    job_url = f"{live_server}/api/jobs/{job_id}"
    with urllib.request.urlopen(job_url) as resp:
        assert resp.status == 200
        job_data = json.loads(resp.read().decode("utf-8"))
        assert job_data.get("status") == "complete"
        assert job_data.get("model") == "SRCNN"

    # Verify PNG download attachment
    dl_png_url = f"{live_server}/api/download/{job_id}?format=png"
    with urllib.request.urlopen(dl_png_url) as resp:
        assert resp.status == 200
        assert "attachment" in resp.headers.get("Content-Disposition", "")
        content = resp.read()
        assert len(content) > 0

    # Verify TIFF download attachment
    dl_tif_url = f"{live_server}/api/download/{job_id}?format=geotiff"
    with urllib.request.urlopen(dl_tif_url) as resp:
        assert resp.status == 200
        assert "attachment" in resp.headers.get("Content-Disposition", "")
        content = resp.read()
        assert len(content) > 0
