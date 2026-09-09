# Tracking: EuroSAT End-to-End Classification Pipeline

- **Feature / Task**: Build PyTorch CNN / ResNet baseline for 10-class land cover classification
- **Date Started**: 2026-09-07
- **Status**: Completed

## Context & Scope
Implement an end-to-end deep learning pipeline for satellite image classification on EuroSAT:
1. Modular dataset loading, class splitting (train/val/test), and data augmentations (flips, rotations, normalization).
2. Model baseline architecture: Transfer learning / fine-tuning with ResNet (ResNet-18) adapted for 10 classes.
3. Training loop with loss tracking, accuracy metrics, and checkpointing.
4. Evaluation and inference script to classify sample satellite patches.

## Design Decisions
- Framework: PyTorch + Torchvision.
- Architecture: ResNet-18 baseline (fast convergence, lightweight footprint).
- Metrics: Accuracy, Precision, Recall, Confusion Matrix.

## Verification & Results
- `src/dataset.py`: 18,900 train, 4,050 val, 4,050 test split. Verified tensor shapes `[16, 3, 64, 64]`.
- `src/model.py`: Forward pass verified with output logits shape `[4, 10]`.
- `src/train.py`: Completed smoke test epoch in 16.7s, Val Acc reached 77.72%, saved `checkpoints/best_model.pth`.
- `src/evaluate.py`: Evaluated test split, generated classification report and confusion matrix in `checkpoints/evaluation_report.json`.
- `src/predict.py`: Tested on sample `AnnualCrop_1.jpg`, accurately predicted `AnnualCrop` as #1.

