"""Unit tests for training step and optimization loop in GeoRes."""

from PIL import Image
import torch
import torch.nn as nn
from src.model import SRCNN
from src.train import train_pipeline


def test_single_training_step():
    """Verify single optimization step computes finite loss and updates gradients."""
    model = SRCNN()
    model.train()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
    criterion = nn.L1Loss()

    lr = torch.rand(4, 3, 64, 64)
    hr = torch.rand(4, 3, 64, 64)

    optimizer.zero_grad()
    pred = model(lr)
    loss = criterion(pred, hr)

    assert torch.isfinite(loss)
    assert loss.item() > 0.0

    loss.backward()

    for p in model.parameters():
        assert p.grad is not None
        assert torch.isfinite(p.grad).all()

    optimizer.step()


def test_train_pipeline_smoke(tmp_path):
    """Verify train_pipeline runs 1 epoch on mock directory and outputs checkpoint."""
    img_dir = tmp_path / "images"
    img_dir.mkdir()
    ckpt_dir = tmp_path / "checkpoints"

    for i in range(2):
        img = Image.new("RGB", (64, 64), color=(50 + i * 20, 80, 100))
        img.save(img_dir / f"tile_{i}.png")

    history = train_pipeline(
        hr_dir=str(img_dir),
        epochs=1,
        batch_size=2,
        lr=1e-4,
        scale=2,
        output_dir=str(ckpt_dir),
    )

    assert "train_loss" in history
    assert len(history["train_loss"]) == 1
    assert history["train_loss"][0] > 0.0
    assert (ckpt_dir / "srcnn_best.pth").exists()
