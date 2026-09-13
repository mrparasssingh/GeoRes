"""Unit tests for standalone prediction and image enhancement in GeoRes."""

from pathlib import Path
from PIL import Image
import torch

from src.model import build_srcnn
from src.predict import enhance_image


def test_enhance_image_smoke(tmp_path):
    """Verify enhance_image upscales image by scale factor and writes valid output."""
    # Create synthetic input 32x32 image
    in_img = Image.new("RGB", (32, 32), color=(100, 150, 200))
    in_path = tmp_path / "input.png"
    in_img.save(in_path)

    # Save mock state_dict
    ckpt_path = tmp_path / "srcnn_mock.pth"
    model = build_srcnn(device=torch.device("cpu"))
    torch.save(model.state_dict(), ckpt_path)

    out_path = tmp_path / "enhanced.png"
    result_path = enhance_image(
        image_path=str(in_path),
        checkpoint_path=str(ckpt_path),
        scale=2,
        output_path=str(out_path),
    )

    assert Path(result_path).exists()
    with Image.open(result_path) as out_img:
        assert out_img.size == (64, 64)
        assert out_img.mode == "RGB"
