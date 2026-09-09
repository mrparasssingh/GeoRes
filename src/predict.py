"""Single-image super-resolution inference for GeoRes SRCNN.

Loads a low-quality input image, upscales via bicubic interpolation,
then refines/sharpens using the trained SRCNN model. Output is a saved
image file — not a printed label or class confidence.

Replaces the old classifier's predict.py (top-k class prediction).
"""

import argparse
import sys
from pathlib import Path

# Ensure project root is present in Python path regardless of working directory
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from PIL import Image
import numpy as np
import torch
from torch.amp import autocast

from src.model import build_srcnn, get_device


def enhance_image(
    image_path: str,
    checkpoint_path: str = "checkpoints/srcnn_best.pth",
    scale: int = 2,
    output_path: str = "enhanced.png",
) -> str:
    """Enhances a single image using trained SRCNN.

    Pipeline:
      1. Load input image
      2. Upscale by `scale`× via bicubic (creates the blurry larger image)
      3. Run through SRCNN to sharpen (spatial size unchanged by the model)
      4. Save output as PNG

    The output image dimensions are (input_width × scale, input_height × scale).

    Args:
        image_path: Path to input low-quality image.
        checkpoint_path: Path to trained SRCNN state_dict.
        scale: Upscale factor.
        output_path: Where to save the enhanced image.

    Returns:
        Path to saved enhanced image.
    """
    device = get_device()

    # Load model
    model = build_srcnn(device=device)
    model.load_state_dict(
        torch.load(checkpoint_path, map_location=device, weights_only=True)
    )
    model.eval()

    # Load and upscale input image via bicubic
    img = Image.open(image_path).convert("RGB")
    orig_w, orig_h = img.size
    upscaled_w, upscaled_h = orig_w * scale, orig_h * scale
    upscaled = img.resize((upscaled_w, upscaled_h), Image.BICUBIC)

    # Convert to tensor: (1, 3, H, W) in [0, 1]
    inp = torch.from_numpy(np.array(upscaled)).permute(2, 0, 1).float().unsqueeze(0) / 255.0
    inp = inp.to(device)

    # Run SRCNN with AMP for speed on 6GB GPU
    with torch.no_grad(), autocast('cuda'):
        out = model(inp)

    # Convert back to image: clamp to valid range, denormalize
    out = out.clamp(0, 1).squeeze(0).permute(1, 2, 0).cpu().numpy()
    out_img = Image.fromarray((out * 255).astype(np.uint8))
    out_img.save(output_path)

    return output_path


def main():
    parser = argparse.ArgumentParser(description="Enhance Image with GeoRes SRCNN")
    parser.add_argument("--image", type=str, required=True,
                        help="Path to input low-quality image")
    parser.add_argument("--weights", type=str, default="checkpoints/srcnn_best.pth",
                        help="SRCNN checkpoint path")
    parser.add_argument("--scale", type=int, default=2, help="Upscale factor")
    parser.add_argument("--out", type=str, default="enhanced.png",
                        help="Output enhanced image path")
    args = parser.parse_args()

    print(f"Input image: {args.image}")
    print(f"Scale factor: {args.scale}×")

    # Load input to report dimensions
    with Image.open(args.image) as img:
        orig_w, orig_h = img.size
    print(f"Input dimensions: {orig_w}×{orig_h}")
    print(f"Output dimensions: {orig_w * args.scale}×{orig_h * args.scale}")

    output = enhance_image(
        image_path=args.image,
        checkpoint_path=args.weights,
        scale=args.scale,
        output_path=args.out,
    )

    # Verify output dimensions
    with Image.open(output) as out_img:
        out_w, out_h = out_img.size
    print(f"\nSaved enhanced image to: {output}")
    print(f"Verified output dimensions: {out_w}×{out_h}")
    assert out_w == orig_w * args.scale and out_h == orig_h * args.scale, \
        f"Dimension mismatch! Expected {orig_w * args.scale}×{orig_h * args.scale}, got {out_w}×{out_h}"
    print("Dimension verification PASSED.")


if __name__ == "__main__":
    main()
