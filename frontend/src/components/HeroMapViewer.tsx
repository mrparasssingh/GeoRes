import { useState, useRef } from 'react'
import { MapPin, Globe2, Sparkles, Layers } from 'lucide-react'

export default function HeroMapViewer() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isMapActive, setIsMapActive] = useState(false)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Mount Leaflet strictly on-demand to protect initial critical-path paint and LCP
  const handleActivateMap = async () => {
    if (isMapActive || isLoading) return
    setIsLoading(true)
    setIsMapActive(true)

    try {
      // Dynamically import Leaflet and its stylesheet only when user requests it
      const [L] = await Promise.all([
        import('leaflet'),
        import('leaflet/dist/leaflet.css'),
      ])

      if (!mapContainerRef.current) return

      // Fix default marker icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
      })

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '© ESRI World Imagery',
          maxZoom: 17,
        }
      ).addTo(map)

      L.marker([12.9716, 77.5946])
        .addTo(map)
        .bindPopup(
          '<b>ISRO HQ</b><br/>Bengaluru, India<br/><small>Sentinel-2 Sample Enhancement Region</small>',
          { maxWidth: 220 }
        )
        .openPopup()

      mapInstanceRef.current = map
      setIsMapLoaded(true)
    } catch (err) {
      console.error('Failed to load interactive Leaflet map:', err)
      setIsMapActive(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-slate-950 select-none"
      style={{
        height: 340,
        boxShadow: '0 24px 64px rgba(15,18,51,0.18)',
        border: '1.5px solid rgba(255,255,255,0.7)',
      }}
    >
      {/* Underlying Leaflet Map Container (Activated on-demand) */}
      <div
        ref={mapContainerRef}
        id="hero-map"
        className="w-full h-full"
        style={{
          display: isMapActive ? 'block' : 'none',
          opacity: isMapLoaded ? 1 : 0,
          transition: 'opacity 0.4s ease-in-out',
        }}
      />

      {/* Instant Fast-Render Sentinel-2 HUD Visual (0ms LCP, 0 external network requests) */}
      {!isMapLoaded && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, #0f172a 0%, #020617 100%)',
          }}
        >
          {/* Geospatial Coordinate Radar Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: `linear-gradient(rgba(15,118,110,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(15,118,110,0.4) 1px, transparent 1px)`,
              backgroundSize: '36px 36px',
            }}
          />

          {/* Orbital Radar Target Circle */}
          <div className="absolute w-64 h-64 rounded-full border border-teal-500/20 pointer-events-none animate-pulse" />
          <div className="absolute w-44 h-44 rounded-full border border-teal-500/10 pointer-events-none" />

          {/* Center Telemetry Content */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300 shadow-lg shadow-teal-950/50">
              <Globe2 size={28} />
            </div>

            <div>
              <div className="text-white font-bold text-base tracking-wide flex items-center justify-center gap-2">
                <Sparkles size={16} className="text-teal-400" />
                <span>Sentinel-2 Earth Observation Radar</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-mono">
                Target: 12.9716° N, 77.5946° E · ISRO HQ (Bengaluru) · 10m/px GSD
              </p>
            </div>

            {/* Interactive Activation CTA */}
            <div className="mt-2">
              <button
                type="button"
                id="activate-map-btn"
                onClick={handleActivateMap}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #0f766e 0%, #0d9490 100%)',
                  boxShadow: '0 4px 16px rgba(15,118,110,0.4)',
                }}
              >
                {isLoading ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Connecting GIS Map Tiles…</span>
                  </>
                ) : (
                  <>
                    <Layers size={14} />
                    <span>Explore Interactive Leaflet Map</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Glassmorphism Status Bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 z-10 pointer-events-none"
        style={{ background: 'rgba(15,18,51,0.82)', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-white font-medium">SATELLITE VIEW</span>
        </div>
        <span className="text-xs font-mono text-slate-200">Sentinel-2 · 10 m/px</span>
      </div>

      {/* Bottom Glassmorphism Coordinate Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-4 py-2 z-10 pointer-events-none"
        style={{ background: 'rgba(15,18,51,0.82)', backdropFilter: 'blur(6px)' }}
      >
        <MapPin size={12} className="text-teal-400 flex-shrink-0" />
        <span className="text-xs font-mono text-slate-200 truncate">India Region · EPSG:4326</span>
        <span className="text-xs font-mono text-teal-300 ml-auto flex-shrink-0 font-medium">SRCNN 4× Ready</span>
      </div>
    </div>
  )
}
