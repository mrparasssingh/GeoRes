"""Super-Resolution Dataset for GeoRes.

Builds (degraded_input, high_res_target) pairs on the fly from a folder of
high-resolution images. No class labels — this is an image-to-image task.

For EuroSAT: tiles are native 64×64 RGB patches. Each tile is used as the
full HR target (no sub-patch cropping). Degraded input is synthesized by
downscaling by `scale` then upscaling back via bicubic interpolation,
simulating the blur that SRCNN learns to reverse.
"""

import os
import random
import sys
from pathlib import Path
from typing import Optional, Tuple

# Ensure project root is present in Python path regardless of execution directory
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from PIL import Image
import numpy as np
import torch
from torch.utils.data import DataLoader, Dataset
import torchvision.transforms.functional as TF


class SRDataset(Dataset):
    """PyTorch Dataset that produces (degraded, HR) image pairs.

    Each high-res image is used as the full target. A degraded version is
    created by downscaling then upscaling back via bicubic interpolation.

    With augments_per_image > 1, each source image yields multiple variants
    via random horizontal/vertical flips and 90° rotations — NOT spatial
    crops (the 64×64 EuroSAT tiles are too small to crop sub-patches from
    without corrupting the ground truth by upscaling first).
    """

    def __init__(
        self,
        hr_dir: str,
        scale: int = 2,
        augments_per_image: int = 2,
    ):
        """Args:
            hr_dir: Path to directory of high-res training images.
            scale: Downscale factor for degradation (2 = halve then double).
            augments_per_image: Number of augmented variants per source image.
        """
        # Use os.walk instead of recursive glob — glob with ** is extremely
        # slow on Windows for flat directories with 27K+ files (EuroSAT layout)
        self.paths = []
        valid_exts = {".png", ".jpg", ".jpeg"}
        for dirpath, _, filenames in os.walk(hr_dir):
            for fname in filenames:
                if os.path.splitext(fname)[1].lower() in valid_exts:
                    self.paths.append(os.path.join(dirpath, fname))
        self.paths.sort()
        if not self.paths:
            raise ValueError(f"No images found under {hr_dir}")
        self.scale = scale
        self.augments_per_image = augments_per_image

    def __len__(self) -> int:
        return len(self.paths) * self.augments_per_image

    def _degrade(self, hr_img: Image.Image) -> Image.Image:
        """Simulate a low-quality photo: downscale then upscale back (bicubic).

        Produces the blurry input SRCNN learns to sharpen. Both input and
        output of this function have the SAME spatial dimensions.
        """
        w, h = hr_img.size
        # Downscale — floor division, minimum 1px to avoid degenerate sizes
        lr = hr_img.resize(
            (max(1, w // self.scale), max(1, h // self.scale)),
            Image.BICUBIC,
        )
        # Upscale back to original size — this is the blurry input
        return lr.resize((w, h), Image.BICUBIC)

    def _augment(self, img: Image.Image) -> Image.Image:
        """Apply random geometric augmentations (flips + 90° rotation).

        These are spatial-preserving transforms that don't change image
        dimensions, suitable for the fixed 64×64 EuroSAT tiles.
        """
        if random.random() > 0.5:
            img = TF.hflip(img)
        if random.random() > 0.5:
            img = TF.vflip(img)
        # Random 0/90/180/270° rotation
        k = random.randint(0, 3)
        if k > 0:
            img = TF.rotate(img, angle=90 * k)
        return img

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        path = self.paths[idx % len(self.paths)]
        img = Image.open(path).convert("RGB")

        # Apply random augmentation to HR image BEFORE degradation,
        # so both HR target and degraded input share the same transform
        img = self._augment(img)

        hr_patch = img
        lr_patch = self._degrade(hr_patch)

        # Convert to float32 tensors in [0, 1] — no ImageNet normalization
        # (SR operates in raw pixel space, not feature-extracted space)
        hr_t = torch.from_numpy(np.array(hr_patch)).permute(2, 0, 1).float() / 255.0
        lr_t = torch.from_numpy(np.array(lr_patch)).permute(2, 0, 1).float() / 255.0
        return lr_t, hr_t


def get_sr_dataloader(
    hr_dir: str = "data/eurosat/Dataset",
    batch_size: int = 32,
    num_workers: int = 2,
    scale: int = 2,
    augments_per_image: int = 2,
    shuffle: bool = True,
) -> DataLoader:
    """Builds and returns a DataLoader for super-resolution training."""
    dataset = SRDataset(hr_dir=hr_dir, scale=scale, augments_per_image=augments_per_image)
    loader = DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=shuffle,
        num_workers=num_workers,
        pin_memory=True,
        drop_last=True,
    )
    return loader


if __name__ == "__main__":
    data_path = sys.argv[1] if len(sys.argv) > 1 else "data/eurosat/Dataset"
    print(f"Testing SR dataset on: {data_path}")
    loader = get_sr_dataloader(hr_dir=data_path, batch_size=8)
    print(f"Total samples (with augments): {len(loader.dataset)}")
    print(f"Source images: {len(loader.dataset.paths)}")

    for lr_batch, hr_batch in loader:
        print(f"LR (degraded) batch shape: {lr_batch.shape}")
        print(f"HR (target)   batch shape: {hr_batch.shape}")
        print(f"LR value range: [{lr_batch.min():.3f}, {lr_batch.max():.3f}]")
        print(f"HR value range: [{hr_batch.min():.3f}, {hr_batch.max():.3f}]")

        # Confirm tiles are exactly 64×64 (native EuroSAT resolution)
        _, _, h, w = hr_batch.shape
        print(f"HR tile dimensions: {w}×{h}")
        assert h == 64 and w == 64, f"Expected 64×64 tiles, got {w}×{h}"
        print("Tile dimension check PASSED (64×64).")
        break

    print("SR dataset module self-test PASSED.")
