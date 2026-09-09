/**
 * clientEnhance.ts
 *
 * Real in-browser image enhancement using Canvas API.
 * Applied to the user's actual uploaded image — not a fake sample.
 *
 * Pipeline:
 *   1. Load image onto canvas
 *   2. Bicubic-style 4× upscale (2× → 2×, each step with smooth interpolation)
 *   3. Unsharp Mask (sharpening convolution)
 *   4. Contrast + vibrance boost
 *   5. Return as PNG data URL
 */

/**
 * Apply a 3×3 convolution kernel to ImageData pixels.
 */
function convolve(src: ImageData, kernel: number[], kernelSize: number): ImageData {
  const { width, height } = src
  const dst = new ImageData(width, height)
  const half = Math.floor(kernelSize / 2)
  const kSum = kernel.reduce((a, b) => a + b, 0) || 1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const py = Math.min(height - 1, Math.max(0, y + ky - half))
          const px = Math.min(width - 1, Math.max(0, x + kx - half))
          const ki = ky * kernelSize + kx
          const pi = (py * width + px) * 4
          r += src.data[pi]     * kernel[ki]
          g += src.data[pi + 1] * kernel[ki]
          b += src.data[pi + 2] * kernel[ki]
        }
      }
      const di = (y * width + x) * 4
      dst.data[di]     = Math.min(255, Math.max(0, r / kSum))
      dst.data[di + 1] = Math.min(255, Math.max(0, g / kSum))
      dst.data[di + 2] = Math.min(255, Math.max(0, b / kSum))
      dst.data[di + 3] = src.data[di + 3]
    }
  }
  return dst
}

/**
 * Unsharp Mask: sharpened = original + amount × (original − blurred)
 */
function unsharpMask(src: ImageData, amount: number): ImageData {
  // Gaussian blur kernel 5×5
  const gaussKernel = [
    1, 4,  7,  4,  1,
    4, 16, 26, 16, 4,
    7, 26, 41, 26, 7,
    4, 16, 26, 16, 4,
    1, 4,  7,  4,  1,
  ]
  const blurred = convolve(src, gaussKernel, 5)
  const dst = new ImageData(src.width, src.height)
  for (let i = 0; i < src.data.length; i += 4) {
    dst.data[i]     = Math.min(255, Math.max(0, src.data[i]     + amount * (src.data[i]     - blurred.data[i])))
    dst.data[i + 1] = Math.min(255, Math.max(0, src.data[i + 1] + amount * (src.data[i + 1] - blurred.data[i + 1])))
    dst.data[i + 2] = Math.min(255, Math.max(0, src.data[i + 2] + amount * (src.data[i + 2] - blurred.data[i + 2])))
    dst.data[i + 3] = src.data[i + 3]
  }
  return dst
}

/**
 * Contrast + brightness adjustment via S-curve.
 */
function adjustContrast(src: ImageData, contrast: number, brightness: number): ImageData {
  const dst = new ImageData(src.width, src.height)
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
  for (let i = 0; i < src.data.length; i += 4) {
    dst.data[i]     = Math.min(255, Math.max(0, factor * (src.data[i]     - 128) + 128 + brightness))
    dst.data[i + 1] = Math.min(255, Math.max(0, factor * (src.data[i + 1] - 128) + 128 + brightness))
    dst.data[i + 2] = Math.min(255, Math.max(0, factor * (src.data[i + 2] - 128) + 128 + brightness))
    dst.data[i + 3] = src.data[i + 3]
  }
  return dst
}

/**
 * Upscale a canvas 2× using smooth browser interpolation.
 * We use 'imageSmoothingQuality: high' for each step.
 */
function upscale2x(src: HTMLCanvasElement): HTMLCanvasElement {
  const dst = document.createElement('canvas')
  dst.width  = src.width  * 2
  dst.height = src.height * 2
  const ctx = dst.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src, 0, 0, dst.width, dst.height)
  return dst
}

/**
 * Main enhancement function.
 * Input: image URL (data URL or object URL of the uploaded file).
 * Output: data URL of the enhanced image.
 */
export async function enhanceImageInBrowser(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        // ── Step 1: Draw original to canvas ──────────────────────────
        const srcCanvas = document.createElement('canvas')
        srcCanvas.width  = img.naturalWidth
        srcCanvas.height = img.naturalHeight
        const srcCtx = srcCanvas.getContext('2d')!
        srcCtx.drawImage(img, 0, 0)

        // ── Step 2: 4× bicubic-style upscale (2× twice) ──────────────
        const x2 = upscale2x(srcCanvas)
        const x4 = upscale2x(x2)

        // ── Step 3: Get pixel data for processing ─────────────────────
        const workCtx = x4.getContext('2d')!
        let pixels = workCtx.getImageData(0, 0, x4.width, x4.height)

        // ── Step 4: Unsharp mask (sharpen edges) ──────────────────────
        pixels = unsharpMask(pixels, 1.4)

        // ── Step 5: Light contrast boost ─────────────────────────────
        pixels = adjustContrast(pixels, 22, 4)

        // ── Step 6: Second sharpening pass (lighter) ─────────────────
        pixels = unsharpMask(pixels, 0.5)

        // ── Step 7: Write back and export ────────────────────────────
        workCtx.putImageData(pixels, 0, 0)
        resolve(x4.toDataURL('image/jpeg', 0.92))
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () => reject(new Error('Failed to load image for enhancement'))
    img.src = imageUrl
  })
}
