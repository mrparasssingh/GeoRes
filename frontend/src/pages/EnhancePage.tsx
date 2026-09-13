import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Image as ImageIcon, Settings, Info } from 'lucide-react'
import UploadZone from '../components/UploadZone'
import ProcessingProgress from '../components/ProcessingProgress'
import ToastContainer from '../components/Toast'
import { useEnhancement } from '../hooks/useEnhancement'
import { useToast } from '../hooks/useToast'
import { SAMPLE_ORIGINAL_URL, DEMO_MODE } from '../utils/constants'
import { formatBytes } from '../utils/fileUtils'

export default function EnhancePage() {
  const navigate = useNavigate()
  const { status, currentStep, job, error, startEnhancement, reset } = useEnhancement()
  const { toasts, toast, removeToast } = useToast()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)  // always set for uploaded files
  const [scale] = useState(4)
  const [model] = useState('SRCNN')
  const channels = 'RGB'  // Only RGB is supported by current SRCNN model

  // Navigate to results when complete
  useEffect(() => {
    if (status === 'complete' && job) {
      setTimeout(() => navigate('/results'), 600)
    }
  }, [status, job, navigate])

  // Show error toast
  useEffect(() => {
    if (status === 'error' && error) {
      toast.error('Enhancement Failed', error)
    }
  }, [status, error])

  const handleFileSelect = useCallback((file: File, preview: string | null) => {
    setSelectedFile(file)
    setPreviewUrl(preview)
    // Always create an Object URL so enhancement can load the image
    const objUrl = URL.createObjectURL(file)
    setObjectUrl(objUrl)
    toast.success('Image loaded', `${file.name} (${formatBytes(file.size)})`)
  }, [toast])

  const handleClear = useCallback(() => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    setObjectUrl(null)
    reset()
  }, [reset, objectUrl])

  const handleError = useCallback((msg: string) => {
    toast.error('Invalid File', msg)
  }, [toast])

  const handleSampleImage = useCallback(() => {
    setSelectedFile(null)
    setPreviewUrl(SAMPLE_ORIGINAL_URL)
    setObjectUrl(null)
    toast.info('Sample image loaded', 'Sentinel-2 medium-resolution crop — India region')
  }, [toast])

  const handleStartEnhancement = async () => {
    if (!previewUrl && !objectUrl && !selectedFile) {
      toast.error('No Image Selected', 'Please upload an image or use the sample image.')
      return
    }
    // Use objectUrl (full file) if available; otherwise use previewUrl (data URL or sample URL)
    const imageUrlForEnhancement = objectUrl ?? previewUrl ?? SAMPLE_ORIGINAL_URL
    let fileToSend = selectedFile
    if (!fileToSend && imageUrlForEnhancement) {
      try {
        const res = await fetch(imageUrlForEnhancement)
        const blob = await res.blob()
        fileToSend = new File([blob], 'sample_sentinel2.jpg', { type: blob.type || 'image/jpeg' })
      } catch (e) {
        console.warn('Could not convert sample to file:', e)
      }
    }
    await startEnhancement(
      fileToSend,
      imageUrlForEnhancement,
      { scale, model, channels }
    )
  }

  const isProcessing = status === 'processing'

  return (
    <div className="pt-16 min-h-screen" style={{ background: '#fafbff' }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <p className="section-label">Enhancement Pipeline</p>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#0f1233', letterSpacing: '-0.02em' }}>
            Enhance Satellite Image
          </h1>
          <p className="text-base" style={{ color: '#6b7280' }}>
            Upload a medium-resolution satellite image to generate an enhanced version using the SRCNN deep learning model.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column: Upload + Settings ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Upload card */}
            <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={16} style={{ color: '#0d9490' }} />
                <span className="font-semibold text-sm" style={{ color: '#0f1233' }}>Image Input</span>
              </div>

              <UploadZone
                onFileSelect={handleFileSelect}
                onError={handleError}
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                onClear={handleClear}
              />

              {/* Try sample */}
              {!previewUrl && !selectedFile && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'rgba(15,18,51,0.08)' }} />
                  <span className="text-xs" style={{ color: '#9ca3af' }}>or</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(15,18,51,0.08)' }} />
                </div>
              )}
              {!previewUrl && !selectedFile && (
                <button
                  id="sample-image-btn"
                  onClick={handleSampleImage}
                  className="mt-3 w-full btn-secondary text-sm"
                  style={{ justifyContent: 'center' }}
                >
                  <ImageIcon size={15} />
                  Try with Sample Image
                </button>
              )}
            </div>

            {/* Image info card */}
            {(selectedFile || previewUrl) && (
              <div className="card p-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={14} style={{ color: '#9ca3af' }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9ca3af' }}>Image Information</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'File Name', value: selectedFile?.name ?? 'sample_original.jpg' },
                    { label: 'File Size', value: selectedFile ? formatBytes(selectedFile.size) : '~2.1 MB (demo)' },
                    { label: 'Format', value: selectedFile ? (selectedFile.name.endsWith('.tif') || selectedFile.name.endsWith('.tiff') ? 'GeoTIFF' : selectedFile.name.split('.').pop()?.toUpperCase() ?? '—') : 'JPEG (demo)' },
                    { label: 'Resolution', value: 'Detected during processing' },
                    { label: 'Channels', value: channels },
                    { label: 'CRS / EPSG', value: 'Not preserved (plain TIFF export)' },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg p-3" style={{ background: '#f0f4ff' }}>
                      <p className="text-xs mb-1" style={{ color: '#9ca3af' }}>{label}</p>
                      <p className="text-xs font-semibold truncate" style={{ color: '#0f1233' }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processing progress */}
            {isProcessing && (
              <div className="animate-slide-up">
                <ProcessingProgress currentStep={currentStep} status={status} />
              </div>
            )}
            {status === 'complete' && (
              <div className="animate-slide-up">
                <ProcessingProgress currentStep={5} status="complete" />
                <p className="text-center text-sm font-medium mt-3" style={{ color: '#0d9490' }}>
                  ✓ Enhancement complete — redirecting to results…
                </p>
              </div>
            )}
          </div>

          {/* ── Right column: Settings + Start ── */}
          <div className="flex flex-col gap-5">
            {/* Settings */}
            <div className="card p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-4">
                <Settings size={15} style={{ color: '#0d9490' }} />
                <span className="font-semibold text-sm" style={{ color: '#0f1233' }}>Enhancement Settings</span>
              </div>
              <div className="flex flex-col gap-4">
                {/* Scale */}
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: '#6b7280' }}>Enhancement Scale</label>
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm"
                    style={{ background: '#f0f4ff', color: '#0f1233' }}
                  >
                    4× Super-Resolution
                    <span className="badge badge-teal">Supported</span>
                  </div>
                </div>

                {/* Model */}
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: '#6b7280' }}>AI Model</label>
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm"
                    style={{ background: '#f0f4ff', color: '#0f1233' }}
                  >
                    SRCNN
                    <span className="badge badge-teal">Active</span>
                  </div>
                </div>

                {/* Channels */}
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: '#6b7280' }}>Channels</label>
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm"
                    style={{ background: '#f0f4ff', color: '#0f1233' }}
                  >
                    RGB (3-channel)
                    <span className="badge badge-teal">Supported</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info note */}
            <div
              className="rounded-xl p-4 text-xs leading-relaxed"
              style={{
                background: DEMO_MODE ? 'rgba(13,148,144,0.06)' : 'rgba(16,185,129,0.08)',
                border: DEMO_MODE ? '1px solid rgba(13,148,144,0.15)' : '1px solid rgba(16,185,129,0.3)',
                color: DEMO_MODE ? '#0f7572' : '#065f46'
              }}
            >
              {DEMO_MODE ? (
                <>
                  <strong>Demo Mode:</strong> The UI is connected to a simulated pipeline.
                  Results use bundled satellite sample imagery.
                </>
              ) : (
                <>
                  <strong>Live Model Connected:</strong> Powered by PyTorch SRCNN running on <code>localhost:8000</code> with CUDA GPU acceleration.
                </>
              )}
            </div>

            {/* Start button */}
            <button
              id="start-enhancement-btn"
              onClick={handleStartEnhancement}
              disabled={isProcessing || status === 'complete'}
              className="btn-primary w-full py-3.5 text-base font-bold"
              style={{ justifyContent: 'center' }}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin-slow w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Processing…
                </>
              ) : status === 'complete' ? (
                <>✓ Done — Redirecting</>
              ) : (
                <>
                  <Zap size={18} />
                  Start Enhancement
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
