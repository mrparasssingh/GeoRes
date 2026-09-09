import { CheckCircle, Circle, Loader2 } from 'lucide-react'
import { PROCESSING_STEPS } from '../utils/constants'

interface ProcessingProgressProps {
  currentStep: number
  status: 'processing' | 'complete' | 'error'
}

export default function ProcessingProgress({ currentStep, status }: ProcessingProgressProps) {
  return (
    <div
      className="w-full rounded-2xl p-6"
      style={{ background: 'white', border: '1px solid rgba(15,18,51,0.07)' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0f1233, #0d9490)' }}
        >
          <Loader2 size={18} className="text-white animate-spin-slow" />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: '#0f1233' }}>
            {status === 'complete' ? 'Enhancement Complete' : 'Processing…'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
            SwinIR deep learning super-resolution pipeline
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-0">
        {PROCESSING_STEPS.map((step, idx) => {
          const stepNum = idx + 1
          const isDone = currentStep > stepNum || status === 'complete'
          const isActive = currentStep === stepNum && status === 'processing'
          const isPending = currentStep < stepNum && status !== 'complete'

          return (
            <div key={step.id} className="flex items-stretch gap-4">
              {/* Connector line + dot */}
              <div className="flex flex-col items-center w-6 flex-shrink-0">
                <div
                  className={`step-dot mt-1 ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}
                />
                {idx < PROCESSING_STEPS.length - 1 && (
                  <div
                    className="w-px flex-1 my-1 transition-colors duration-500"
                    style={{ background: isDone ? '#0d9490' : 'rgba(15,18,51,0.1)' }}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 pb-4 ${idx === PROCESSING_STEPS.length - 1 ? 'pb-0' : ''}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="font-semibold text-sm transition-colors"
                    style={{ color: isDone ? '#0d9490' : isActive ? '#0f1233' : '#9ca3af' }}
                  >
                    {step.label}
                  </span>
                  {isDone && <CheckCircle size={13} style={{ color: '#0d9490' }} />}
                  {isActive && (
                    <Loader2 size={13} className="animate-spin-slow" style={{ color: '#0d9490' }} />
                  )}
                  {isPending && <Circle size={13} style={{ color: '#d1d5db' }} />}
                </div>
                <p
                  className="text-xs transition-colors"
                  style={{ color: isDone ? '#0d9490' : isActive ? '#6b7280' : '#d1d5db' }}
                >
                  {isDone ? `✓ ${step.description.replace('…', '')}` : step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-5 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(15,18,51,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${status === 'complete' ? 100 : (currentStep / PROCESSING_STEPS.length) * 100}%`,
            background: 'linear-gradient(90deg, #0f1233 0%, #0d9490 100%)',
          }}
        />
      </div>
      <p className="text-xs mt-2 text-right font-mono" style={{ color: '#9ca3af' }}>
        {status === 'complete' ? '100%' : `${Math.round((currentStep / PROCESSING_STEPS.length) * 100)}%`}
      </p>
    </div>
  )
}
