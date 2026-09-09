import { useState, useRef, useCallback, useEffect } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from 'lucide-react'

interface ImageViewerProps {
  src: string
  alt?: string
  label?: string
}

export default function ImageViewer({ src, alt = 'Satellite image', label }: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const clampScale = (s: number) => Math.max(0.5, Math.min(4, s))

  const zoomIn = useCallback(() => setScale((s) => clampScale(s + 0.25)), [])
  const zoomOut = useCallback(() => setScale((s) => clampScale(s - 0.25)), [])
  const reset = useCallback(() => setScale(1), [])

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handleFSChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false)
    }
    document.addEventListener('fullscreenchange', handleFSChange)
    return () => document.removeEventListener('fullscreenchange', handleFSChange)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden"
      style={{
        background: '#0a0e1a',
        border: '1.5px solid rgba(15,18,51,0.10)',
      }}
    >
      {/* Label */}
      {label && (
        <div className="absolute top-3 left-3 z-10">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(15,18,51,0.75)', color: 'white', backdropFilter: 'blur(4px)' }}
          >
            {label}
          </span>
        </div>
      )}

      {/* Image */}
      <div
        className="overflow-auto"
        style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease',
            maxWidth: '100%',
            display: 'block',
            userSelect: 'none',
          }}
        />
      </div>

      {/* Controls */}
      <div
        className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-xl p-1"
        style={{ background: 'rgba(15,18,51,0.75)', backdropFilter: 'blur(8px)' }}
      >
        <button
          id="zoom-out-btn"
          onClick={zoomOut}
          title="Zoom Out"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors hover:bg-white/10"
          aria-label="Zoom out"
        >
          <ZoomOut size={15} />
        </button>
        <span className="text-white text-xs font-mono px-1 min-w-[40px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          id="zoom-in-btn"
          onClick={zoomIn}
          title="Zoom In"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors hover:bg-white/10"
          aria-label="Zoom in"
        >
          <ZoomIn size={15} />
        </button>
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.2)' }} />
        <button
          id="reset-view-btn"
          onClick={reset}
          title="Reset View"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors hover:bg-white/10"
          aria-label="Reset view"
        >
          <RotateCcw size={15} />
        </button>
        <button
          id="fullscreen-btn"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors hover:bg-white/10"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      {/* Scale indicator top-right (only when zoomed) */}
      {scale !== 1 && (
        <div className="absolute top-3 right-3 z-10">
          <span
            className="px-2 py-0.5 rounded-lg text-xs font-mono"
            style={{ background: 'rgba(13,148,144,0.85)', color: 'white' }}
          >
            {scale.toFixed(2)}×
          </span>
        </div>
      )}
    </div>
  )
}
