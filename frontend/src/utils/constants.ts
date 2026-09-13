// ─── Demo Mode ──────────────────────────────────────────────────────────────
// Set to false to connect the real PyTorch SRCNN backend on localhost:8000
export const DEMO_MODE = false

// ─── API ─────────────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// ─── Enhancement Options ─────────────────────────────────────────────────────
export const SUPPORTED_SCALES = [4] as const
export const SUPPORTED_MODELS = ['SRCNN'] as const
export const SUPPORTED_CHANNELS = ['RGB'] as const

// ─── File Upload ─────────────────────────────────────────────────────────────
export const MAX_FILE_SIZE_MB = 100
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const ACCEPTED_EXTENSIONS = ['.tif', '.tiff', '.png', '.jpg', '.jpeg']
export const ACCEPTED_MIME_TYPES = [
  'image/tiff',
  'image/png',
  'image/jpeg',
  'image/jpg',
  // GeoTIFF often comes as application/octet-stream
  'application/octet-stream',
]

// ─── Sample Images ────────────────────────────────────────────────────────────
export const SAMPLE_ORIGINAL_URL = '/sample/sample_original.jpg'
export const SAMPLE_ENHANCED_URL = '/sample/sample_enhanced.jpg'

// ─── Processing steps ────────────────────────────────────────────────────────
export const PROCESSING_STEPS = [
  { id: 'upload',       label: 'Uploading',       description: 'Image received' },
  { id: 'prepare',      label: 'Preparing',        description: 'Image prepared' },
  { id: 'enhance',      label: 'AI Enhancement',   description: 'SRCNN 3-layer convolution…' },
  { id: 'reconstruct',  label: 'Output Assembly',  description: 'Converting tensor to output image' },
  { id: 'complete',     label: 'Complete',          description: 'Preparing result' },
] as const

// ─── Demo processing total duration (ms) ─────────────────────────────────────
export const DEMO_PROCESSING_MS = 6000
