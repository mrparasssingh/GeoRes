# Tracking: Full Multi-Epoch Model Training

- **Feature / Task**: Run full-dataset training (5 epochs across 27,000 EuroSAT Sentinel-2 images) on NVIDIA RTX 3050 GPU.
- **Date Started**: 2026-09-07
- **Status**: Completed

## Configuration
- **Dataset**: EuroSAT (27,000 images: 18,900 train, 4,050 val, 4,050 test)
- **Input Size**: 224 x 224 (bicubic/bilinear RGB interpolation)
- **Model**: ResNet-18 ImageNet pretrained + custom 10-class head (Dropout 0.2 + Linear)
- **Loss**: CrossEntropyLoss with dynamic inverse-frequency class weights
- **Optimizer**: AdamW (lr=1e-4, weight_decay=1e-4)
- **Scheduler**: CosineAnnealingLR (T_max=5)
- **Batch Size**: 64
- **Epochs**: 5
- **Hardware**: NVIDIA GeForce RTX 3050 6GB Laptop GPU (CUDA 12.6)

## Training Progression
- Epoch 1: Train Loss 0.2717, Train Acc 91.50% | Val Loss 0.1135, Val Acc 96.86%
- Epoch 2: Train Loss 0.1046, Train Acc 96.68% | Val Loss 0.0753, Val Acc 97.33%
- Epoch 3: Train Loss 0.0738, Train Acc 97.61% | Val Loss 0.0542, Val Acc 98.22%
- Epoch 4: Train Loss 0.0525, Train Acc 98.26% | Val Loss 0.0486, Val Acc 98.35% (Best Checkpoint)
- Epoch 5: Train Loss 0.0400, Train Acc 98.77% | Val Loss 0.0499, Val Acc 98.25%
- Total Duration: 10.68 minutes

## Full Test Set Evaluation (4,050 Images)
- **Overall Accuracy**: **98.62%**
- **Macro Average**: Precision 0.99, Recall 0.99, F1 0.99
- **Single-Image Inference Tests**:
  - `Forest_1.jpg`: Forest (99.96%)
  - `SeaLake_1.jpg`: SeaLake (99.99%)
  - `Residential_1.jpg`: Residential (99.92%)

