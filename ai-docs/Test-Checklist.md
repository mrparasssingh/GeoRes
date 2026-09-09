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

## Phase 2: PyTorch Baseline Classification Pipeline
- [x] Install PyTorch dependencies:
  - Command: `.\.venv\Scripts\pip install torch torchvision matplotlib scikit-learn`
  - Actual Result: Successfully installed torch-2.14.0, torchvision-0.29.0, scikit-learn-1.9.0, matplotlib-3.11.1 (exit code 0).
- [x] Verify dataset loader & augmentations:
  - Command: `.\.venv\Scripts\python src/dataset.py`
  - Actual Result: Train samples: 18,900 | Val: 4,050 | Test: 4,050. Image shape: `[16, 3, 64, 64]`. Self-test PASSED (exit code 0).
- [x] Verify model initialization:
  - Command: `.\.venv\Scripts\python src/model.py`
  - Actual Result: ResNet-18 initialized with custom 10-class head. Dummy batch shape: `[4, 10]`. Self-test PASSED (exit code 0).
- [x] Run fast smoke training epoch:
  - Command: `.\.venv\Scripts\python src/train.py --epochs 1 --smoke-test`
  - Actual Result: Epoch 1 finished in 16.7s. Train Acc: 51.22%, Val Acc: 77.72%. Saved `checkpoints/best_model.pth` and `checkpoints/training_history.json` (exit code 0).
- [x] Verify evaluation script:
  - Command: `.\.venv\Scripts\python src/evaluate.py --smoke-test`
  - Actual Result: Computed classification report and confusion matrix, saved `checkpoints/evaluation_report.json` (exit code 0).
- [x] Test sample image inference:
  - Command: `.\.venv\Scripts\python src/predict.py --image data/eurosat/Dataset/Forest_1.jpg`
  - Actual Result: Prediction executed cleanly with top-k confidence outputs (exit code 0).

## Phase 3: Audit Resolutions Verification
- [x] Verify CUDA GPU detection:
  - Command: `.\.venv\Scripts\python -c "import torch; print(torch.cuda.is_available(), torch.cuda.get_device_name(0))"`
  - Actual Result: `CUDA: True | Device: NVIDIA GeForce RTX 3050 6GB Laptop GPU` (exit code 0).
- [x] Verify dataset stratified subsets and 224x224 transforms:
  - Command: `.\.venv\Scripts\python src/dataset.py`
  - Actual Result: `Batch shape [16, 3, 224, 224]`, self-test PASSED with all 10 classes (exit code 0).
- [x] Verify class-weighted smoke training with quiet device logging:
  - Command: `.\.venv\Scripts\python src/train.py --epochs 1 --smoke-test`
  - Actual Result: Trained in 5.5s on RTX 3050. Train Acc: 53.55%, Val Acc: 75.13% with class weights. Checkpoint saved to `checkpoints/best_model.pth` (exit code 0).
- [x] Verify quiet single-image prediction:
  - Command: `.\.venv\Scripts\python src/predict.py --image data/eurosat/Dataset/Forest_1.jpg`
  - Actual Result: Top-1 predicted `Forest (38.63%)`, clean output without duplicate device logs (exit code 0).
- [x] Verify full 10-class evaluation with balanced support:
  - Command: `.\.venv\Scripts\python src/evaluate.py --smoke-test`
  - Actual Result: Overall Accuracy: 77.42% across all 10 classes (Pasture F1: 0.86, SeaLake Precision: 1.00) (exit code 0).

## Phase 4: Full Multi-Epoch GPU Training & Evaluation
- [x] Train 5 full epochs on entire 27,000 EuroSAT dataset:
  - Command: `.\.venv\Scripts\python src/train.py --epochs 5 --batch-size 64 --lr 1e-4`
  - Actual Result: Completed 5 epochs in 10.68 minutes. Best Val Acc: 98.35%. Saved `checkpoints/best_model.pth` (exit code 0).
- [x] Evaluate on all 4,050 unseen test satellite images:
  - Command: `.\.venv\Scripts\python src/evaluate.py`
  - Actual Result: **Overall Accuracy: 98.62%**, Macro F1: 0.99 across all 10 classes. Saved `checkpoints/evaluation_report.json` (exit code 0).
- [x] Single-image confidence predictions on trained weights:
  - Command: `.\.venv\Scripts\python src/predict.py --image data/eurosat/Dataset/Forest_1.jpg` -> `Forest (99.96%)`
  - Command: `.\.venv\Scripts\python src/predict.py --image data/eurosat/Dataset/SeaLake_1.jpg` -> `SeaLake (99.99%)`
  - Command: `.\.venv\Scripts\python src/predict.py --image data/eurosat/Dataset/Residential_1.jpg` -> `Residential (99.92%)`

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

