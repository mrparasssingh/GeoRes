import { ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_BYTES } from './constants'

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : ''
}

export function isValidImageFile(file: File): { valid: boolean; error?: string } {
  const ext = getFileExtension(file.name)
  if (!ACCEPTED_EXTENSIONS.includes(ext as never)) {
    return {
      valid: false,
      error: `Unsupported file type "${ext}". Please upload a GeoTIFF (.tif/.tiff), PNG or JPG image.`,
    }
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large (${formatBytes(file.size)}). Maximum size is 100 MB.`,
    }
  }
  return { valid: true }
}

export function getFileFormat(filename: string): string {
  const ext = getFileExtension(filename).replace('.', '').toUpperCase()
  if (ext === 'TIF' || ext === 'TIFF') return 'GeoTIFF'
  return ext || 'Unknown'
}

/**
 * Read an image file and return a data URL for preview.
 * Returns null for GeoTIFF files (binary, can't be previewed natively).
 */
export async function getImagePreview(file: File): Promise<string | null> {
  const ext = getFileExtension(file.name)
  if (ext === '.tif' || ext === '.tiff') return null // browser can't render raw GeoTIFF
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string ?? null)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

/**
 * Trigger a file download from a URL or data URL.
 */
export function downloadFile(url: string, filename: string): void {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * Trigger a download by fetching a URL and saving as blob.
 * Keeps object URL alive for 60 seconds so users with 'Save As' dialog prompts
 * don't experience premature blob revocation failures.
 */
export async function downloadFromUrl(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    downloadFile(objectUrl, filename)
    // 60-second safety window gives ample time in OS save dialog before cleanup
    setTimeout(() => {
      try {
        URL.revokeObjectURL(objectUrl)
      } catch {}
    }, 60000)
  } catch (err) {
    console.warn('Blob download fallback to direct anchor:', err)
    // Fallback: direct link
    downloadFile(url, filename)
  }
}
