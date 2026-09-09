# Tracking: Audit Report Fixes

- **Feature / Task**: Resolve all 10 issues identified in the code audit report.
- **Date Started**: 2026-09-07
- **Status**: Completed

## Scope & Audit Findings Matrix

| ID | Category | Item | Status | Resolution / Target File |
|---|---|---|---|---|
| **C1** | Critical | PyTorch is CPU-only (CUDA not active) | **Resolved** | Reinstalled `torch-2.14.0+cu126` & `torchvision-0.29.0+cu126`. Verified RTX 3050 active. |
| **C2** | Critical | Biased subset slicing in dataset loader | **Resolved** | Added `_stratified_subset` in [`src/dataset.py`](file:///d:/SIH%20hackathon%202026/GeoRes/src/dataset.py). |
| **C3** | Critical | `sys.path` inconsistency and missing package setup | **Resolved** | Added root `sys.path` in [`src/dataset.py`](file:///d:/SIH%20hackathon%202026/GeoRes/src/dataset.py) and created [`pyproject.toml`](file:///d:/SIH%20hackathon%202026/GeoRes/pyproject.toml). |
| **S1** | Significant | Class imbalance ignored in loss calculation | **Resolved** | Added inverse-frequency class weighting to `CrossEntropyLoss` in [`src/train.py`](file:///d:/SIH%20hackathon%202026/GeoRes/src/train.py). |
| **S2** | Significant | `weights_only` warning in `torch.load` | **Resolved** | Added `weights_only=False` in [`src/evaluate.py`](file:///d:/SIH%20hackathon%202026/GeoRes/src/evaluate.py) & [`src/predict.py`](file:///d:/SIH%20hackathon%202026/GeoRes/src/predict.py). |
| **S3** | Significant | Image size 64x64 sub-optimal for ResNet-18 | **Resolved** | Default image resize set to 224x224 in [`src/dataset.py`](file:///d:/SIH%20hackathon%202026/GeoRes/src/dataset.py). |
| **M1** | Minor | Repeated verbose prints in `get_device()` | **Resolved** | Added `_DEVICE_LOGGED` print-once caching in [`src/model.py`](file:///d:/SIH%20hackathon%202026/GeoRes/src/model.py). |
| **M2** | Minor | Global image ignore patterns in `.gitignore` | **Resolved** | Scoped image ignores to `data/**/*.jpg` in [`.gitignore`](file:///d:/SIH%20hackathon%202026/GeoRes/.gitignore). |
| **M3** | Minor | In-function `import random` in `dataset.py` | **Resolved** | Moved `import random` to top-level in [`src/dataset.py`](file:///d:/SIH%20hackathon%202026/GeoRes/src/dataset.py). |
| **M4** | Minor | Missing `requirements.txt` manifest | **Resolved** | Created reproducible [`requirements.txt`](file:///d:/SIH%20hackathon%202026/GeoRes/requirements.txt). |

## Verification Results
1. **CUDA Acceleration**: NVIDIA GeForce RTX 3050 6GB Laptop GPU active (`CUDA: True`).
2. **Stratified Subset & Transforms**: Input image size `[16, 3, 224, 224]`, equal proportions across all 10 classes.
3. **Class-Weighted Training**: Trained smoke epoch in 5.5s on GPU, Val Acc 75.13%, loss smoothly converged.
4. **Evaluation**: Overall accuracy 77.42% across all 10 classes with realistic, balanced support numbers (e.g. Pasture F1: 0.86, SeaLake Precision: 1.00).
5. **Inference**: Single-image prediction runs cleanly on `Forest_1.jpg` without duplicate device printouts.

