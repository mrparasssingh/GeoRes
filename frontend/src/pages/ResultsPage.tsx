import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Download, ArrowLeft, Maximize2, ZoomIn, ZoomOut, RotateCcw, RefreshCw } from 'lucide-react'
import { useEnhancement } from '../hooks/useEnhancement'
import ComparisonSlider from '../components/ComparisonSlider'
import { ResultCard } from '../components/ResultCard'
import ToastContainer from '../components/Toast'
import { useToast } from '../hooks/useToast'
import { downloadFromUrl } from '../utils/fileUtils'
import { SAMPLE_ORIGINAL_URL, SAMPLE_ENHANCED_URL } from '../utils/constants'

export default function ResultsPage() {
  const navigate = useNavigate()
  const { job, status } = useEnhancement()
  const { toasts, toast, removeToast } = useToast()
  const [sliderKey, setSliderKey] = useState(0)
  const [viewerScale, setViewerScale] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // job.originalUrl = the URL of the user's uploaded image (Object URL or sample URL)
  // job.enhancedUrl = the enhanced version (data URL, static URL, or demo sample)
  const originalUrl = job?.originalUrl ?? SAMPLE_ORIGINAL_URL
  const enhancedUrl = job?.enhancedUrl ?? SAMPLE_ENHANCED_URL
  // isDemo = true only if using sample image; false if user uploaded a real image
  const isDemo = !job || job.isDemo
  const filename = job?.filename?.replace(/\.[^.]+$/, '') ?? 'satellite_image'

  // Use relative URLs for proxy compatibility (job URLs are now relative from server)
  const downloadPngUrl = job?.downloadPngUrl ?? enhancedUrl
  const downloadTifUrl = job?.downloadTifUrl ?? enhancedUrl

  const handleDownloadPng = async () => {
    toast.info('Downloading…', 'Saving enhanced image as PNG')
    try {
      await downloadFromUrl(downloadPngUrl, `${filename}_enhanced_4x.png`)
    } catch {
      window.open(downloadPngUrl, '_blank')
    }
  }

  const handleDownloadGeoTiff = async () => {
    toast.info('Downloading…', isDemo ? 'Demo mode: downloading PNG as .tif' : 'Saving enhanced TIFF result')
    try {
      await downloadFromUrl(downloadTifUrl, `${filename}_enhanced_4x.tif`)
    } catch {
      window.open(downloadTifUrl, '_blank')
    }
  }

  const handleEnhanceAnother = () => {
    navigate('/enhance')
  }

  const handleFullscreen = () => {
    const el = document.getElementById('comparison-fullscreen-wrap')
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const resultRows = [
    { label: 'Enhancement', value: '4× Super-Resolution', highlight: true },
    { label: 'Model', value: job?.model ?? 'GeoRes SRCNN (PyTorch CUDA)' },
    { label: 'Input', value: '10 m medium-resolution imagery' },
    { label: 'Output', value: 'Enhanced high-detail imagery' },
    { label: 'Format', value: 'TIFF / PNG' },
    { label: 'Metadata', value: 'Plain TIFF (no geospatial metadata)' },
    { label: 'Processing', value: isDemo ? 'Demo Simulation' : 'Completed', highlight: !isDemo },
  ]

  return (
    <div className="pt-16 min-h-screen" style={{ background: '#fafbff' }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-slide-up">
          <div>
            <p className="section-label">Enhancement Result</p>
            <h1 className="text-3xl font-bold" style={{ color: '#0f1233', letterSpacing: '-0.02em' }}>
              Super-Resolution Result
            </h1>
          </div>
          {isDemo && (
            <span className="badge badge-demo px-3 py-1.5 text-xs self-start sm:self-center">
              ⚠ Demo Processing
            </span>
          )}
        </div>

        {/* ── Comparison Slider ── */}
        <div className="card overflow-hidden mb-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          {/* Controls bar */}
          <div
            className="flex items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: 'rgba(15,18,51,0.07)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: '#0f1233' }}>Before / After Comparison</span>
              <span className="badge badge-teal text-xs">Drag slider to compare</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                id="result-zoom-out"
                onClick={() => setViewerScale(s => Math.max(0.5, s - 0.25))}
                title="Zoom Out"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{ color: '#0f1233' }}
                aria-label="Zoom out"
              >
                <ZoomOut size={15} />
              </button>
              <span className="text-xs font-mono px-2" style={{ color: '#6b7280' }}>
                {Math.round(viewerScale * 100)}%
              </span>
              <button
                id="result-zoom-in"
                onClick={() => setViewerScale(s => Math.min(4, s + 0.25))}
                title="Zoom In"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{ color: '#0f1233' }}
                aria-label="Zoom in"
              >
                <ZoomIn size={15} />
              </button>
              <button
                id="result-reset"
                onClick={() => { setViewerScale(1); setSliderKey(k => k + 1) }}
                title="Reset View"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{ color: '#0f1233' }}
                aria-label="Reset view"
              >
                <RotateCcw size={15} />
              </button>
              <button
                id="result-fullscreen"
                onClick={handleFullscreen}
                title="Fullscreen"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{ color: '#0f1233' }}
                aria-label="Toggle fullscreen"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>

          {/* Comparison area */}
          <div
            id="comparison-fullscreen-wrap"
            style={{
              transform: `scale(${viewerScale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
              background: '#0a0e1a',
            }}
          >
            <ComparisonSlider
              key={sliderKey}
              beforeUrl={originalUrl}
              afterUrl={enhancedUrl}
              beforeLabel="Original (10 m)"
              afterLabel="Enhanced 4×"
            />
          </div>
        </div>

        {/* ── Bottom: result info + downloads ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Result metadata */}
          <div className="lg:col-span-2">
            <ResultCard title="Enhancement Details" rows={resultRows} />
          </div>

          {/* Downloads */}
          <div className="flex flex-col gap-4">
            <div className="card p-5">
              <p className="font-semibold text-sm mb-4" style={{ color: '#0f1233' }}>Download Result</p>
              <div className="flex flex-col gap-3">
                <button
                  id="download-png-btn"
                  onClick={handleDownloadPng}
                  className="btn-primary w-full"
                  style={{ justifyContent: 'center' }}
                >
                  <Download size={16} />
                  Download PNG
                </button>
                <button
                  id="download-geotiff-btn"
                  onClick={handleDownloadGeoTiff}
                  className="btn-secondary w-full"
                  style={{ justifyContent: 'center' }}
                >
                  <Download size={16} />
                  Download TIFF
                  {isDemo && <span className="badge badge-demo ml-1 text-xs py-0">demo</span>}
                </button>

                {isDemo && (
                  <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
                    In demo mode, TIFF download provides the sample PNG with a .tif extension.
                    Real TIFF output requires the live PyTorch backend.
                  </p>
                )}
              </div>
            </div>

            {/* Enhance another */}
            <button
              id="enhance-another-btn"
              onClick={handleEnhanceAnother}
              className="btn-navy w-full"
              style={{ justifyContent: 'center' }}
            >
              <RefreshCw size={16} />
              Enhance Another Image
            </button>

            {/* Quick stats */}
            <div className="card p-5">
              <p className="font-semibold text-sm mb-3" style={{ color: '#0f1233' }}>Quick Stats</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Scale', value: '4×' },
                  { label: 'Model', value: job?.model ?? 'SRCNN' },
                  { label: 'Architecture', value: '3-Layer CNN' },
                  { label: 'Processing', value: 'Bicubic + SR' },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-3 text-center" style={{ background: '#f0f4ff' }}>
                    <p className="text-xs mb-1" style={{ color: '#9ca3af' }}>{label}</p>
                    <p className="text-sm font-bold" style={{ color: '#0d9490' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigate back */}
        <div className="mt-8 flex justify-start">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: '#9ca3af' }}
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
