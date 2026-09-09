import { useRef, useState, useCallback, useEffect } from 'react'
import { ChevronsLeftRight } from 'lucide-react'

interface ComparisonSliderProps {
  beforeUrl: string
  afterUrl: string
  beforeLabel?: string
  afterLabel?: string
}

export default function ComparisonSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Original',
  afterLabel = 'Enhanced 4×',
}: ComparisonSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(50) // percentage 0–100
  const [dragging, setDragging] = useState(false)

  const getPositionFromEvent = useCallback((clientX: number): number => {
    const el = containerRef.current
    if (!el) return 50
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    return Math.max(2, Math.min(98, pct))
  }, [])

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return
    setPosition(getPositionFromEvent(e.clientX))
  }, [dragging, getPositionFromEvent])

  const handleMouseUp = useCallback(() => setDragging(false), [])

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragging) return
    const touch = e.touches[0]
    setPosition(getPositionFromEvent(touch.clientX))
  }, [dragging, getPositionFromEvent])

  const handleTouchEnd = useCallback(() => setDragging(false), [])

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: true })
      window.addEventListener('touchend', handleTouchEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [dragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // Click on container to jump position
  const handleContainerClick = (e: React.MouseEvent) => {
    // Only respond to direct container click, not drag
    if (!dragging) {
      setPosition(getPositionFromEvent(e.clientX))
    }
  }

  return (
    <div
      ref={containerRef}
      className="comparison-container w-full select-none"
      style={{
        cursor: dragging ? 'ew-resize' : 'crosshair',
        aspectRatio: '16/9',
        minHeight: 280,
        maxHeight: 520,
        background: '#0f1233',
      }}
      onClick={handleContainerClick}
    >
      {/* AFTER (right — full width, clipped by slider) */}
      <img
        src={afterUrl}
        alt="Enhanced satellite image"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* BEFORE (left — clipped to slider position) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${position}%` }}
      >
        <img
          src={beforeUrl}
          alt="Original satellite image"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${(100 / position) * 100}%`, maxWidth: 'none' }}
          draggable={false}
        />
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <span
          className="px-2.5 py-1 rounded-lg text-xs font-semibold"
          style={{ background: 'rgba(15,18,51,0.75)', color: 'white', backdropFilter: 'blur(4px)' }}
        >
          {beforeLabel}
        </span>
      </div>
      <div className="absolute top-3 right-3 z-20 pointer-events-none">
        <span
          className="px-2.5 py-1 rounded-lg text-xs font-semibold"
          style={{ background: 'rgba(13,148,144,0.85)', color: 'white', backdropFilter: 'blur(4px)' }}
        >
          {afterLabel}
        </span>
      </div>

      {/* Slider handle */}
      <div
        className="comparison-slider-handle"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="comparison-slider-button">
          <ChevronsLeftRight size={18} />
        </div>
      </div>
    </div>
  )
}
