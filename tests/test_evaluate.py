"""Unit tests for evaluation module and PSNR calculation in GeoRes."""

import math
from pathlib import Path
from PIL import Image
import pytest
import torch

from src.evaluate import compute_psnr, evaluate_model
from src.model import build_srcnn


def test_compute_psnr_identical():
    """Verify PSNR of identical tensors evaluates to infinity."""
    t = torch.rand(3, 64, 64)
    psnr = compute_psnr(t, t)
    assert math.isinf(psnr)
    assert psnr > 0


def test_compute_psnr_known_value():
    """Verify PSNR matches mathematical formula 10 * log10(1 / MSE)."""
    # Create target of all zeros, prediction with constant error 0.1
    target = torch.zeros(1, 10, 10)
    pred = torch.full((1, 10, 10), 0.1)
    # MSE = 0.01 -> 1 / MSE = 100 -> log10(100) = 2 -> 10 * 2 = 20 dB
    psnr = compute_psnr(pred, target)
    assert pytest.approx(psnr, rel=1e-3) == 20.0


def test_evaluate_model_smoke(tmp_path):
    """Verify evaluate_model runs over mock dataset and generates JSON report."""
    img_dir = tmp_path / "images"
    img_dir.mkdir()
    for i in range(2):
        img = Image.new("RGB", (64, 64), color=(60 + i * 30, 90, 120))
        img.save(img_dir / f"tile_{i}.png")

    # Save mock state_dict
    ckpt_path = tmp_path / "srcnn_test.pth"
    model = build_srcnn(device=torch.device("cpu"))
    torch.save(model.state_dict(), ckpt_path)

    report = evaluate_model(
        checkpoint_path=str(ckpt_path),
        hr_dir=str(img_dir),
        batch_size=2,
        scale=2,
        max_batches=1,
    )

    assert "total_samples" in report
    assert report["total_samples"] == 2
    assert "avg_srcnn_psnr_db" in report
    assert "avg_bicubic_psnr_db" in report
    assert "improvement_db" in report
    assert (tmp_path / "sr_evaluation_report.json").exists()
