"""Evaluation Module for GeoRes SRCNN Super-Resolution.

Computes PSNR (Peak Signal-to-Noise Ratio) on a validation set of
(degraded, HR) pairs. PSNR > 30 dB at ×2 scale is a reasonable target.
"""

import argparse
import json
import math
import os
import sys
from pathlib import Path
from typing import Dict

# Ensure project root is present in Python path regardless of working directory
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import torch
from torch.amp import autocast

from src.dataset import get_sr_dataloader
from src.model import build_srcnn, get_device


def compute_psnr(pred: torch.Tensor, target: torch.Tensor) -> float:
    """Compute PSNR between predicted and target images.

    Both tensors should be in [0, 1] range. Returns PSNR in dB.
    Higher is better; infinity means perfect reconstruction.
    """
    mse = torch.mean((pred - target) ** 2).item()
    if mse == 0:
        return float("inf")
    # MAX pixel value is 1.0 since tensors are normalized to [0, 1]
    return 10.0 * math.log10(1.0 / mse)


def evaluate_model(
    checkpoint_path: str = "checkpoints/srcnn_best.pth",
    hr_dir: str = "data/eurosat/Dataset",
    batch_size: int = 32,
    scale: int = 2,
    max_batches: int = 50,
) -> Dict:
    """Evaluates SRCNN checkpoint using PSNR on validation pairs.

    Args:
        checkpoint_path: Path to saved SRCNN state_dict.
        hr_dir: Directory of HR images for generating eval pairs.
        batch_size: Batch size for evaluation.
        scale: Downscale factor matching training.
        max_batches: Cap evaluation batches to keep runtime reasonable.
    """
    device = get_device()

    if not os.path.isfile(checkpoint_path):
        raise FileNotFoundError(f"Checkpoint not found at: {checkpoint_path}")

    # Build eval dataloader (no shuffle, no augmentation for determinism)
    loader = get_sr_dataloader(
        hr_dir=hr_dir,
        batch_size=batch_size,
        scale=scale,
        augments_per_image=1,  # No augmentation for evaluation
        shuffle=False,
    )
    print(f"Loaded {len(loader.dataset)} evaluation samples.")

    # Load model and weights
    model = build_srcnn(device=device)
    model.load_state_dict(torch.load(checkpoint_path, map_location=device, weights_only=True))
    model.eval()

    # Also compute PSNR for bicubic baseline (degraded input vs HR target)
    # to show how much SRCNN improves over simple bicubic upsampling
    total_srcnn_psnr = 0.0
    total_bicubic_psnr = 0.0
    total_samples = 0

    with torch.no_grad():
        for batch_idx, (lr_img, hr_img) in enumerate(loader):
            if batch_idx >= max_batches:
                break

            lr_img = lr_img.to(device, non_blocking=True)
            hr_img = hr_img.to(device, non_blocking=True)

            if device.type == "cuda":
                with autocast('cuda'):
                    pred = model(lr_img)
            else:
                pred = model(lr_img)
            # Clamp to valid pixel range for fair PSNR comparison
            pred = pred.clamp(0, 1).float()

            batch_size_actual = lr_img.size(0)
            for i in range(batch_size_actual):
                srcnn_psnr = compute_psnr(pred[i], hr_img[i])
                bicubic_psnr = compute_psnr(lr_img[i], hr_img[i])
                total_srcnn_psnr += srcnn_psnr
                total_bicubic_psnr += bicubic_psnr
                total_samples += 1

    avg_srcnn_psnr = total_srcnn_psnr / max(1, total_samples)
    avg_bicubic_psnr = total_bicubic_psnr / max(1, total_samples)
    improvement = avg_srcnn_psnr - avg_bicubic_psnr

    print("\n" + "=" * 60)
    print("GEORES SRCNN EVALUATION REPORT")
    print("=" * 60)
    print(f"Evaluated on:        {total_samples} samples")
    print(f"Scale factor:        {scale}×")
    print(f"Bicubic PSNR:        {avg_bicubic_psnr:.2f} dB (baseline)")
    print(f"SRCNN PSNR:          {avg_srcnn_psnr:.2f} dB")
    print(f"Improvement:         +{improvement:.2f} dB over bicubic")
    print("=" * 60)

    # Save evaluation report
    out_dir = os.path.dirname(checkpoint_path) or "checkpoints"
    eval_path = os.path.join(out_dir, "sr_evaluation_report.json")
    report = {
        "total_samples": total_samples,
        "scale": scale,
        "avg_srcnn_psnr_db": round(avg_srcnn_psnr, 4),
        "avg_bicubic_psnr_db": round(avg_bicubic_psnr, 4),
        "improvement_db": round(improvement, 4),
    }
    with open(eval_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"Evaluation report saved to {eval_path}")

    return report


def main():
    parser = argparse.ArgumentParser(description="Evaluate GeoRes SRCNN Super-Resolution")
    parser.add_argument("--checkpoint", type=str, default="checkpoints/srcnn_best.pth",
                        help="SRCNN checkpoint file path")
    parser.add_argument("--hr_dir", type=str, default="data/eurosat/Dataset",
                        help="High-res image directory")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--scale", type=int, default=2, help="Downscale factor")
    parser.add_argument("--max_batches", type=int, default=50,
                        help="Max batches to evaluate (cap runtime)")
    args = parser.parse_args()

    evaluate_model(
        checkpoint_path=args.checkpoint,
        hr_dir=args.hr_dir,
        batch_size=args.batch_size,
        scale=args.scale,
        max_batches=args.max_batches,
    )


if __name__ == "__main__":
    main()
