"""GeoRes SRCNN (Super-Resolution Convolutional Neural Network) architecture.

A 3-layer fully-convolutional network for satellite image super-resolution:
- Conv2d(3→64, 9×9) + ReLU  — Patch Extraction
- Conv2d(64→32, 5×5) + ReLU — Non-Linear Mapping  
- Conv2d(32→3, 5×5)         — Reconstruction

Total parameters: ~69,251 (~280 KB checkpoint).
Operates on pre-upscaled input (bicubic) and outputs sharpened result
at the same spatial dimensions.
"""

from typing import Optional
import torch
import torch.nn as nn


# Internal state to ensure device diagnostics are printed only once
_DEVICE_LOGGED = False


def get_device(verbose: bool = False) -> torch.device:
    """Selects CUDA device if available, otherwise falls back to CPU.

    Logs device selection on first call or when verbose=True to prevent
    repeated console cluttering in downstream inference/eval scripts.
    """
    global _DEVICE_LOGGED
    if torch.cuda.is_available():
        device = torch.device("cuda")
        if verbose or not _DEVICE_LOGGED:
            gpu_name = torch.cuda.get_device_name(0)
            print(f"[Device] Utilizing CUDA GPU: {gpu_name}")
            _DEVICE_LOGGED = True
    else:
        device = torch.device("cpu")
        if verbose or not _DEVICE_LOGGED:
            print("[Device] CUDA unavailable. Falling back to CPU.")
            _DEVICE_LOGGED = True
    return device


class SRCNN(nn.Module):
    """3-layer CNN for single-image super-resolution.

    Architecture (Dong et al., 2014):
      conv1: Patch extraction + representation (3→64, 9×9 kernel)
      conv2: Non-linear mapping                (64→32, 5×5 kernel)
      conv3: Reconstruction                    (32→3,  5×5 kernel)

    ReLU after conv1 and conv2 only. conv3 outputs raw pixel values
    (no activation) for direct regression against the HR ground truth.

    Input and output are the SAME spatial size — no downsampling or
    upsampling happens inside the network. The bicubic upsampling is
    done as a preprocessing step BEFORE feeding into the model.
    """

    def __init__(self):
        super().__init__()
        # Patch extraction + representation: large 9×9 receptive field
        # captures coarse structure from the blurry bicubic input
        self.conv1 = nn.Conv2d(3, 64, kernel_size=9, padding=4)
        # Non-linear mapping: reduces channel dimension while learning
        # the mapping from blurry features to sharp features
        self.conv2 = nn.Conv2d(64, 32, kernel_size=5, padding=2)
        # Reconstruction: collapses 32 feature maps back to 3-channel RGB.
        # No activation — direct pixel regression so output can span [0, 1]
        self.conv3 = nn.Conv2d(32, 3, kernel_size=5, padding=2)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass: blurry image in → sharpened image out.

        Args:
            x: Tensor of shape (B, 3, H, W) in range [0, 1].
        Returns:
            Tensor of shape (B, 3, H, W) — same spatial size as input.
        """
        x = self.relu(self.conv1(x))
        x = self.relu(self.conv2(x))
        x = self.conv3(x)  # no activation — direct pixel regression
        return x


def build_srcnn(device: Optional[torch.device] = None) -> SRCNN:
    """Factory function to build and move SRCNN to appropriate compute device."""
    dev = device or get_device()
    model = SRCNN()
    return model.to(dev)


if __name__ == "__main__":
    print("Testing SRCNN model architecture...")
    dev = get_device(verbose=True)
    model = build_srcnn(device=dev)

    # Self-test: verify output shape matches input spatial dims
    dummy_input = torch.randn(4, 3, 64, 64, device=dev)
    output = model(dummy_input)
    print(f"Dummy input shape:  {dummy_input.shape}")
    print(f"Output image shape: {output.shape}")
    assert output.shape == (4, 3, 64, 64), f"Expected (4, 3, 64, 64), got {output.shape}"

    # Confirm final layer is Conv2d, NOT Linear
    final_layer = model.conv3
    print(f"Final layer type: {type(final_layer).__name__}")
    print(f"Final layer spec: {final_layer}")
    assert isinstance(final_layer, nn.Conv2d), f"Expected Conv2d, got {type(final_layer).__name__}"

    # Print full architecture summary
    total_params = sum(p.numel() for p in model.parameters())
    print(f"Total parameters: {total_params:,}")
    print("SRCNN architecture self-test PASSED.")
