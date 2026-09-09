import { DEMO_PROCESSING_MS, PROCESSING_STEPS, SAMPLE_ENHANCED_URL, SAMPLE_ORIGINAL_URL } from '../utils/constants'
import { enhanceImageInBrowser } from '../utils/clientEnhance'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EnhancementOptions {
  scale: number
  model: string
  channels: string
}

export interface EnhancementJob {
  jobId: string
  status: 'queued' | 'processing' | 'complete' | 'error'
  currentStep: number   // index into PROCESSING_STEPS
  originalUrl: string
  enhancedUrl?: string
  enhancedTifUrl?: string
  downloadPngUrl?: string
  downloadTifUrl?: string
  filename: string
  isDemo: boolean
  error?: string
  model?: string
  scale?: number
  latency_ms?: number
}

type ProgressCallback = (step: number) => void

// ─── Mock API (Demo Mode) ─────────────────────────────────────────────────────

let _currentJob: EnhancementJob | null = null

function generateJobId(): string {
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Simulate the enhancement pipeline with timed step progression.
 * Uses real Canvas API enhancement on the user's actual image.
 */
export async function mockEnhanceImage(
  file: File | null,
  originalPreviewUrl: string,
  _options: EnhancementOptions,
  onStep: ProgressCallback,
): Promise<EnhancementJob> {
  const jobId = generateJobId()
  const stepCount = PROCESSING_STEPS.length
  // Reserve last 40% of time for the actual enhancement computation
  const earlyStepDuration = (DEMO_PROCESSING_MS * 0.6) / (stepCount - 1)

  // Determine if user uploaded a real image or is using the sample
  const isUsingRealImage = !!(file || (originalPreviewUrl && originalPreviewUrl !== SAMPLE_ORIGINAL_URL))
  const effectiveOriginalUrl = isUsingRealImage ? originalPreviewUrl : SAMPLE_ORIGINAL_URL

  const job: EnhancementJob = {
    jobId,
    status: 'processing',
    currentStep: 0,
    originalUrl: effectiveOriginalUrl,
    filename: file?.name ?? 'sample_image.jpg',
    isDemo: !isUsingRealImage,
  }

  _currentJob = job

  // ── Steps 1–3: Simulate pipeline progress ────────────────────────────────
  for (let i = 0; i < stepCount - 1; i++) {
    await new Promise<void>((resolve) => setTimeout(resolve, earlyStepDuration))
    job.currentStep = i + 1
    onStep(i + 1)

    // During step 3 (AI Enhancement), run the actual computation
    if (i === 2) {
      try {
        // Run real client-side enhancement on the uploaded image
        const enhanced = await enhanceImageInBrowser(effectiveOriginalUrl)
        job.enhancedUrl = enhanced
      } catch (err) {
        // Fallback to bundled sample if something goes wrong (e.g. CORS on sample URL)
        console.warn('Client enhancement failed, using bundled sample:', err)
        job.enhancedUrl = isUsingRealImage ? effectiveOriginalUrl : SAMPLE_ENHANCED_URL
      }
    }
  }

  // ── Final step ────────────────────────────────────────────────────────────
  await new Promise<void>((resolve) => setTimeout(resolve, earlyStepDuration))
  job.currentStep = stepCount
  onStep(stepCount)

  // If enhancement didn't run (e.g. sample image from public folder — CORS blocked),
  // fall back gracefully
  if (!job.enhancedUrl) {
    job.enhancedUrl = SAMPLE_ENHANCED_URL
  }

  job.status = 'complete'
  _currentJob = job
  return job
}

export function getMockJob(): EnhancementJob | null {
  return _currentJob
}

export function clearMockJob(): void {
  _currentJob = null
}

export { SAMPLE_ORIGINAL_URL, SAMPLE_ENHANCED_URL }
