"""Unit tests for SRDataset in GeoRes."""

import pytest
from PIL import Image
import torch
from src.dataset import SRDataset


@pytest.fixture
def mock_image_dir(tmp_path):
    """Creates a temporary directory with a single synthetic 64x64 RGB image."""
    img_dir = tmp_path / "images"
    img_dir.mkdir()
    img = Image.new("RGB", (64, 64), color=(120, 150, 180))
    img.save(img_dir / "sample_01.png")
    return str(img_dir)


def test_srdataset_len_explicit_augments(mock_image_dir):
    """Verify len(dataset) == len(paths) * augments_per_image when augments_per_image=1."""
    dataset = SRDataset(hr_dir=mock_image_dir, scale=2, augments_per_image=1)
    assert len(dataset) == 1


def test_srdataset_len_default_augments(mock_image_dir):
    """Verify len(dataset) == 2 with default augments_per_image=2 for 1 input image."""
    dataset = SRDataset(hr_dir=mock_image_dir, scale=2)
    assert dataset.augments_per_image == 2
    assert len(dataset) == 2


def test_srdataset_getitem_shapes_and_ranges(mock_image_dir):
    """Verify (lr, hr) tensor shapes and normalized value range [0.0, 1.0]."""
    dataset = SRDataset(hr_dir=mock_image_dir, scale=2, augments_per_image=1)
    lr, hr = dataset[0]

    assert isinstance(lr, torch.Tensor)
    assert isinstance(hr, torch.Tensor)
    assert lr.shape == (3, 64, 64)
    assert hr.shape == (3, 64, 64)
    assert lr.dtype == torch.float32
    assert hr.dtype == torch.float32

    assert lr.min().item() >= 0.0
    assert lr.max().item() <= 1.0
    assert hr.min().item() >= 0.0
    assert hr.max().item() <= 1.0


def test_srdataset_empty_dir_raises(tmp_path):
    """Verify ValueError is raised when directory contains no valid images."""
    empty_dir = tmp_path / "empty"
    empty_dir.mkdir()
    with pytest.raises(ValueError, match="No images found"):
        SRDataset(hr_dir=str(empty_dir))
