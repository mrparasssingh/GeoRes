# Test Checklist

Concrete commands to run and expected output, checked before any change counts as done.

## Checklist
- [x] Check Kaggle CLI installation & authentication:
  - Command: `kaggle --version` / `python -m kaggle --version`
  - Actual Result: `kaggle` is not recognized; `No module named kaggle` in Python 3.14.
- [x] Check Kaggle credentials:
  - Path: `C:\Users\mrpar\.kaggle\access_token` and `KAGGLE_API_TOKEN` environment variable
  - Actual Result: Created and verified (`True`).
- [x] Install kaggle in a dedicated virtual environment (`.venv`):
  - Command: `.\.venv\Scripts\pip install kaggle`
  - Actual Result: Successfully installed (exit code 0).
- [x] Pull Kaggle starter kernel:
  - Command: `.\.venv\Scripts\kaggle kernels pull kerneler/starter-eurosat-sentinel-2-dataset-0469bae4-9`
  - Actual Result: Downloaded `starter-eurosat-sentinel-2-dataset-0469bae4-9.ipynb` (exit code 0).
- [x] Verify file integrity:
  - Command: `.\.venv\Scripts\python -c "import json; nb = json.load(open('starter-eurosat-sentinel-2-dataset-0469bae4-9.ipynb', encoding='utf-8')); print('Valid notebook with', len(nb['cells']), 'cells')"`
  - Actual Result: `Valid notebook with 11 cells` (valid JSON).

## Phase 1: EuroSAT Dataset Download
- [x] Download EuroSAT dataset:
  - Command: `.\.venv\Scripts\kaggle datasets download -d raoofnaushad/eurosat-sentinel2-dataset -p data/eurosat/ --unzip`
  - Actual Result: Downloaded and extracted into `data/eurosat/Dataset` (exit code 0).
- [x] Verify dataset structure:
  - Command: `.\.venv\Scripts\python -c "import os; files = os.listdir('data/eurosat/Dataset'); print('Total:', len(files)); classes = set(f.split('_')[0] for f in files); print(sorted(list(classes)))"`
  - Actual Result: 27,000 images across 10 classes (`AnnualCrop`, `Forest`, `HerbaceousVegetation`, `Highway`, `Industrial`, `Pasture`, `PermanentCrop`, `Residential`, `River`, `SeaLake`).

## ~~Phase 2–4: PyTorch Classifier Pipeline (REMOVED)~~

> **Note**: Phases 2–4 tested the original ResNet-18 classification pipeline
> which was replaced by the SRCNN super-resolution pipeline on 2026-09-08.
> These phases are no longer testable with the current codebase. Historical
> results are preserved in `ai-docs/tracking/classification-pipeline.md`.

## Phase 5: Localhost Full-Stack Serving
- [x] Verify Backend Health & CUDA Acceleration:
  - Command: `.\.venv\Scripts\python -c "import urllib.request; resp = urllib.request.urlopen('http://localhost:8000/health'); print(resp.read().decode())"`
  - Actual Result: `{"status": "healthy", "model": "SRCNN", "device": "cuda", "vram_allocated_mb": 0.27}` (exit code 0).
- [x] Verify React/Vite Frontend Serving:
  - Command: `.\.venv\Scripts\python -c "import urllib.request; resp = urllib.request.urlopen('http://localhost:5173/'); print('Status:', resp.getcode())"`
  - Actual Result: `Status: 200` (exit code 0).
- [x] Verify Browser Rendering:
  - Automated browser subagent navigation to `http://localhost:5173/` and `http://localhost:5173/enhance` passed with all UI components active.
- [x] Verify Native PNG Download Attachment:
  - Command: `.\.venv\Scripts\python -c "import urllib.request; req = urllib.request.urlopen('http://localhost:8000/api/download/job-e72768d7?format=png'); print(req.getcode(), dict(req.getheaders())['Content-Disposition'])"`
  - Actual Result: `200 attachment; filename="Forest_1_enhanced_4x.png"` (exit code 0).
- [x] Verify Native GeoTIFF (.tif) Download Attachment:
  - Command: `.\.venv\Scripts\python -c "import urllib.request; req = urllib.request.urlopen('http://localhost:8000/api/download/job-e72768d7?format=geotiff'); print(req.getcode(), dict(req.getheaders())['Content-Disposition'])"`
  - Actual Result: `200 attachment; filename="Forest_1_enhanced_4x.tif"` (exit code 0).
- [x] Full UI Browser Download Trigger:
  - Automated browser test confirmed clicking "Download PNG" and "Download GeoTIFF" on `/results` triggers direct attachment downloads with 0 errors.

## Phase 6: Codebase Remediation & Test Suite
- [x] Verify Frontend Build Integrity:
  - Command: `npm run build` (in `frontend/`)
  - Actual Result: `tsc -b && vite build` passed in 588ms with 0 errors (exit code 0).
- [x] Verify Pytest Unit Test Suite:
  - Command: `.\.venv\Scripts\python.exe -m pytest -v`
  - Actual Result: 21 passed in 13.89s (exit code 0):
    - `test_dataset.py`: 4 passed (shapes, ranges, lengths, error handling)
    - `test_model.py`: 4 passed (CPU factory, param count, 64x64, arbitrary dimensions)
    - `test_train.py`: 2 passed (single training step, 1-epoch pipeline smoke)
    - `test_evaluate.py`: 3 passed (PSNR identical inf, PSNR 20 dB formula, evaluate_model report)
    - `test_predict.py`: 1 passed (enhance_image smoke test)
    - `test_server.py`: 7 passed (super-resolution, dimension guard, job eviction, health, CORS, 404, enhance+downloads)

## Phase 7: Deep Audit Remediation & Full E2E Browser Verification
- [x] Complete Audit Remediation:
  - Addressed all 35 findings (6 Critical, 8 High, 12 Medium, 9 Low).
  - CPU-safe GradScaler/autocast, 100MB upload limit, 4096px image dimension limit, 1h job TTL eviction, restricted CORS, relative proxy API URLs, lossless PIL 90° rotation, cleaned unused dependencies.
- [x] Live Full-Stack End-to-End Browser Test:
  - Verified on `http://localhost:5173/` and `http://localhost:8000`:
    - HomePage (`/`): Headline, stats, feature cards load cleanly with 0 console errors.
    - How It Works (`/how-it-works`): 4-step pipeline cards and REST API endpoints table verified.
    - Enhance (`/enhance`): RGB-only mode, 4x scale, sample tile selection, live processing stepper.
    - Results (`/results`): Interactive Before/After split comparison slider, zoom controls, metrics card, and PNG/TIFF attachment downloads verified.

## Phase 8: Motion-Primitives UI Enhancement Verification
- [x] Verify Motion Dependency & Core Components Lint:
  - Command: `npm --prefix frontend run lint`
  - Actual Result: 0 errors across 33 files with 0 warnings on newly created core components.
- [x] Verify Isolated Chunk Bundling:
  - Command: `npm run build`
  - Actual Result: Built in 691ms; `vendor-motion` isolated (124 kB / gzip 40 kB); `HomePage` remains compact at 28.8 kB.
- [x] Verify Full Pytest Backend Regression:
  - Command: `.\.venv\Scripts\python.exe -m pytest`
  - Actual Result: All 21 passed in 13.86s (exit code 0).
- [x] End-to-End Visual & Interactive Browser Verification:
  - Automated browser session verified TextShimmer badge, TextLoop dynamic headline, InfiniteSlider continuous marquee, AnimatedNumber spring counters, Spotlight dark card hover, Tilt parallax, BorderTrail processing animation, and ComparisonSlider on `/results` with 0 console errors.


