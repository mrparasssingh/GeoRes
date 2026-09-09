import { useState, useCallback, useRef } from 'react'
import { DEMO_MODE } from '../utils/constants'
import { mockEnhanceImage, type EnhancementJob, type EnhancementOptions, clearMockJob, getMockJob } from '../services/mockApi'
import { realEnhanceImage, pollJobStatus } from '../services/api'

export type EnhancementStatus = 'idle' | 'processing' | 'complete' | 'error'

interface UseEnhancementReturn {
  status: EnhancementStatus
  currentStep: number
  job: EnhancementJob | null
  error: string | null
  startEnhancement: (file: File | null, previewUrl: string, options: EnhancementOptions) => Promise<void>
  reset: () => void
}

let _activeRealJob: EnhancementJob | null = null

function getInitialJob(): EnhancementJob | null {
  if (_activeRealJob) return _activeRealJob
  try {
    const saved = sessionStorage.getItem('geores_active_job')
    if (saved) {
      _activeRealJob = JSON.parse(saved)
      return _activeRealJob
    }
  } catch (e) {
    // Ignore storage errors
  }
  return null
}

export function useEnhancement(): UseEnhancementReturn {
  const [status, setStatus] = useState<EnhancementStatus>(() => getInitialJob() ? 'complete' : 'idle')
  const [currentStep, setCurrentStep] = useState(() => getInitialJob() ? 5 : 0)
  const [job, setJob] = useState<EnhancementJob | null>(getInitialJob)
  const [error, setError] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const reset = useCallback(() => {
    setStatus('idle')
    setCurrentStep(0)
    setJob(null)
    setError(null)
    _activeRealJob = null
    try {
      sessionStorage.removeItem('geores_active_job')
    } catch (e) {}
    clearMockJob()
    if (pollingRef.current) clearInterval(pollingRef.current)
  }, [])

  const startEnhancement = useCallback(async (
    file: File | null,
    previewUrl: string,
    options: EnhancementOptions,
  ) => {
    setStatus('processing')
    setCurrentStep(0)
    setError(null)

    try {
      if (DEMO_MODE) {
        const completedJob = await mockEnhanceImage(file, previewUrl, options, (step) => {
          setCurrentStep(step)
        })
        setJob(completedJob)
        setStatus('complete')
      } else {
        // Real backend flow
        if (!file) throw new Error('No file selected')
        const { jobId } = await realEnhanceImage(file, options)

        // Check status immediately (model often finishes in <50ms on GPU), then poll every 500ms
        const checkStatus = async () => {
          try {
            const polledJob = await pollJobStatus(jobId)
            setCurrentStep(polledJob.currentStep ?? 5)
            if (polledJob.status === 'complete') {
              if (pollingRef.current) clearInterval(pollingRef.current)
              _activeRealJob = polledJob
              try {
                sessionStorage.setItem('geores_active_job', JSON.stringify(polledJob))
              } catch (e) {}
              setJob(polledJob)
              setStatus('complete')
            } else if (polledJob.status === 'error') {
              if (pollingRef.current) clearInterval(pollingRef.current)
              setError(polledJob.error ?? 'Processing failed')
              setStatus('error')
            }
          } catch (pollErr) {
            if (pollingRef.current) clearInterval(pollingRef.current)
            setError('Lost connection to server.')
            setStatus('error')
          }
        }
        await checkStatus()
        pollingRef.current = setInterval(checkStatus, 500)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(msg)
      setStatus('error')
    }
  }, [])

  // Expose active job if needed externally
  const effectiveJob = job ?? (DEMO_MODE ? getMockJob() : getInitialJob())

  return { status, currentStep, job: effectiveJob, error, startEnhancement, reset }
}
