"""Training Engine for GeoRes SRCNN Super-Resolution.

Runs training loop with AMP (mandatory for 6GB RTX 3050), tracks L1 loss,
and checkpoints the best-performing model weights by lowest validation loss.

No accuracy/F1 metrics — this is pixel-wise image regression, not classification.
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Dict, List

# Ensure project root is present in Python path regardless of working directory
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import torch
import torch.nn as nn
from torch.amp import autocast, GradScaler

from src.dataset import get_sr_dataloader
from src.model import build_srcnn, get_device


def train_pipeline(
    hr_dir: str = "data/eurosat/Dataset",
    epochs: int = 30,
    batch_size: int = 32,
    lr: float = 1e-4,
    scale: int = 2,
    output_dir: str = "checkpoints",
) -> Dict[str, List[float]]:
    """Executes full SR training lifecycle with AMP.

    Trains SRCNN on (degraded, HR) pairs using L1 loss. Saves best checkpoint
    by lowest epoch loss. Logs VRAM usage for monitoring GPU memory pressure.
    """
    device = get_device(verbose=True)
    os.makedirs(output_dir, exist_ok=True)

    loader = get_sr_dataloader(
        hr_dir=hr_dir,
        batch_size=batch_size,
        scale=scale,
    )
    total_samples = len(loader.dataset)
    print(f"Dataset ready. Total samples (with augments): {total_samples}")
    print(f"Source images: {len(loader.dataset.paths)}")
    print(f"Batch size: {batch_size} | Scale factor: {scale}×")

    model = build_srcnn(device=device)

    # Adam (not AdamW) — weight decay is less important for this tiny 3-layer model
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    # AMP scaler — only used when CUDA is available (mandatory for 6GB VRAM)
    use_amp = device.type == "cuda"
    scaler = GradScaler('cuda') if use_amp else None

    # L1Loss produces sharper results than MSE for super-resolution
    # (MSE tends to produce blurry averages; L1 preserves edges better)
    criterion = nn.L1Loss()

    best_loss = float("inf")
    history: Dict[str, List[float]] = {"train_loss": []}

    start_time = time.time()
    for epoch in range(1, epochs + 1):
        epoch_start = time.time()
        model.train()
        running_loss = 0.0

        total_batches = len(loader)
        for batch_idx, (lr_img, hr_img) in enumerate(loader, start=1):
            lr_img = lr_img.to(device, non_blocking=True)
            hr_img = hr_img.to(device, non_blocking=True)

            optimizer.zero_grad(set_to_none=True)
            if use_amp:
                with autocast('cuda'):
                    pred = model(lr_img)
                    loss = criterion(pred, hr_img)
                scaler.scale(loss).backward()
                scaler.step(optimizer)
                scaler.update()
            else:
                pred = model(lr_img)
                loss = criterion(pred, hr_img)
                loss.backward()
                optimizer.step()

            running_loss += loss.item() * lr_img.size(0)

            # Log progress every 100 batches or at end of epoch
            if batch_idx % 100 == 0 or batch_idx == total_batches:
                print(f"  [Batch {batch_idx:04d}/{total_batches:04d}] L1: {loss.item():.5f}")

        epoch_loss = running_loss / total_samples
        elapsed = time.time() - epoch_start
        history["train_loss"].append(epoch_loss)

        # Report VRAM usage (requested in verification plan)
        vram_msg = ""
        if device.type == "cuda":
            allocated_mb = torch.cuda.memory_allocated(device) / (1024 ** 2)
            reserved_mb = torch.cuda.memory_reserved(device) / (1024 ** 2)
            vram_msg = f" | VRAM: {allocated_mb:.0f}MB alloc / {reserved_mb:.0f}MB reserved"

        print(
            f"Epoch [{epoch:02d}/{epochs:02d}] ({elapsed:.1f}s) | "
            f"L1 loss: {epoch_loss:.5f}{vram_msg}"
        )

        # Save best checkpoint (keyed on lowest loss, not highest accuracy)
        if epoch_loss < best_loss:
            best_loss = epoch_loss
            checkpoint_path = os.path.join(output_dir, "srcnn_best.pth")
            # Save state_dict only — this model is tiny, no need for optimizer state
            torch.save(model.state_dict(), checkpoint_path)
            print(f"  -> Best checkpoint saved (L1: {best_loss:.5f}) at {checkpoint_path}")

    # Save final checkpoint regardless of performance
    torch.save(model.state_dict(), os.path.join(output_dir, "srcnn_last.pth"))

    total_time = time.time() - start_time
    print(f"\nTraining completed in {total_time / 60:.2f} minutes. Best L1: {best_loss:.5f}")

    # Persist metrics history
    history_path = os.path.join(output_dir, "sr_training_history.json")
    with open(history_path, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    return history


def main():
    parser = argparse.ArgumentParser(description="Train GeoRes SRCNN Super-Resolution")
    parser.add_argument("--hr_dir", type=str, default="data/eurosat/Dataset",
                        help="Folder of high-res training images")
    parser.add_argument("--epochs", type=int, default=30, help="Number of epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--patch_size", type=int, default=64,
                        help="Expected tile size (for documentation; EuroSAT is native 64×64)")
    parser.add_argument("--scale", type=int, default=2, help="Downscale factor for degradation")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--out", type=str, default="checkpoints", help="Output checkpoint directory")
    args = parser.parse_args()

    print(f"[Config] patch_size={args.patch_size}, scale={args.scale}×, "
          f"batch_size={args.batch_size}, lr={args.lr}")

    train_pipeline(
        hr_dir=args.hr_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        scale=args.scale,
        output_dir=args.out,
    )


if __name__ == "__main__":
    main()
