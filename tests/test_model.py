"""Unit tests for SRCNN model architecture in GeoRes."""

import torch
from src.model import SRCNN, build_srcnn


def test_build_srcnn_cpu():
    """Verify factory function initializes SRCNN on CPU."""
    model = build_srcnn(device=torch.device("cpu"))
    assert isinstance(model, SRCNN)
    assert not next(model.parameters()).is_cuda


def test_srcnn_parameter_count():
    """Verify model parameter count matches standard 3-layer SRCNN (~69K params)."""
    model = SRCNN()
    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    assert total_params == 69251


def test_srcnn_output_shape_64x64():
    """Verify forward pass preserves spatial dimensions on 64x64 input."""
    model = SRCNN()
    model.eval()
    x = torch.randn(2, 3, 64, 64)
    with torch.no_grad():
        out = model(x)
    assert out.shape == (2, 3, 64, 64)
    assert out.dtype == torch.float32


def test_srcnn_arbitrary_dimensions():
    """Verify fully-convolutional model accepts variable spatial input sizes."""
    model = SRCNN()
    model.eval()
    x = torch.randn(1, 3, 128, 96)
    with torch.no_grad():
        out = model(x)
    assert out.shape == (1, 3, 128, 96)
