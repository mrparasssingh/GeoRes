import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Zap, ArrowRight, Layers, Database, Upload, Cpu, MapPin, Satellite, ScanSearch } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon paths for Vite
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const features = [
  {
    icon: <Zap size={22} style={{ color: '#0d9490' }} />,
    title: '4× Spatial Enhancement',
    desc: 'Upscale medium-resolution imagery by 4× using SwinIR deep learning, revealing fine spatial details invisible at the original resolution.',
  },
  {
    icon: <Database size={22} style={{ color: '#0d9490' }} />,
    title: 'GeoTIFF Metadata Preservation',
    desc: 'CRS, EPSG codes and geospatial metadata are carried through the pipeline so the output can be used directly in GIS workflows.',
  },
  {
    icon: <Layers size={22} style={{ color: '#0d9490' }} />,
    title: 'Seam-Free Reconstruction',
    desc: 'Gaussian-weighted blending of overlapping 512×512 tiles eliminates seam artifacts and ensures a continuous, seamless output.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Upload',
    desc: 'Upload a medium-resolution satellite image in GeoTIFF, PNG or JPG format.',
    icon: <Upload size={26} />,
    color: '#2563eb',
    glow: 'rgba(37,99,235,0.18)',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
  },
  {
    num: '02',
    title: 'Enhance',
    desc: 'The deep learning pipeline tiles, enhances and reconstructs the image at 4× spatial resolution.',
    icon: <Cpu size={26} />,
    color: '#0d9490',
    glow: 'rgba(13,148,144,0.18)',
    gradient: 'linear-gradient(135deg, #0f7572 0%, #14b8b0 100%)',
  },
  {
    num: '03',
    title: 'Analyze',
    desc: 'Compare original and enhanced imagery side-by-side and download the result.',
    icon: <ScanSearch size={26} />,
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.18)',
    gradient: 'linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)',
  },
]

export default function HomePage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
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
        '<b>ISRO HQ</b><br/>Bengaluru, India<br/><small>Sample enhancement region</small>',
        { maxWidth: 200 }
      )

    mapInstance.current = map
    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  return (
    <div className="pt-16 min-h-screen bg-hero">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28 px-4">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(13,148,144,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(15,18,51,0.06) 0%, transparent 50%)',
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10 animate-slide-up">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
            style={{ color: '#0f1233', letterSpacing: '-0.03em' }}
          >
            Turn Medium-Resolution
            <br />
            <span className="gradient-text">Satellite Images</span>
            <br />
            into High-Detail Maps
          </h1>

          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto" style={{ color: '#4a5568', lineHeight: 1.7 }}>
            Super-resolution enhancement for clearer satellite imagery, faster analysis
            and smarter geospatial decisions — without expensive commercial imagery.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/enhance" id="hero-enhance-btn" className="btn-primary text-base px-8 py-3">
              <Zap size={18} />
              Enhance an Image
            </Link>
            <Link to="/how-it-works" id="hero-how-btn" className="btn-secondary text-base px-8 py-3">
              See How It Works
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Map visual */}
        <div className="max-w-3xl mx-auto mt-16 px-4">
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              boxShadow: '0 24px 64px rgba(15,18,51,0.18)',
              border: '1.5px solid rgba(255,255,255,0.6)',
            }}
          >
            <div ref={mapRef} style={{ height: 340, width: '100%', zIndex: 1 }} id="hero-map" />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 2, background: 'linear-gradient(180deg, transparent 80%, rgba(13,148,144,0.15) 100%)' }}
            />

            {/* Top bar */}
            <div
              className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 z-10"
              style={{ background: 'rgba(15,18,51,0.75)', backdropFilter: 'blur(8px)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono text-white/80">SATELLITE VIEW</span>
              </div>
              <span className="text-xs font-mono text-white/60">Sentinel-2 · 10 m/px</span>
            </div>

            {/* Bottom bar */}
            <div
              className="absolute bottom-0 left-0 right-0 flex items-center gap-4 px-4 py-2 z-10"
              style={{ background: 'rgba(15,18,51,0.6)', backdropFilter: 'blur(4px)' }}
            >
              <MapPin size={12} className="text-teal-400" />
              <span className="text-xs font-mono text-white/70">India Region · EPSG:4326</span>
              <span className="text-xs font-mono text-white/40 ml-auto">SwinIR Enhancement Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 Steps — Premium Dark Design ─────────────────────── */}
      <section className="py-24 px-4" style={{ background: '#0d1117' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: '#0d9490' }}
            >
              How It Works
            </p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold"
              style={{ color: 'white', letterSpacing: '-0.02em' }}
            >
              Three simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop) */}
            <div
              className="hidden md:block absolute top-[52px] left-[calc(16.66%+40px)] right-[calc(16.66%+40px)] h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, rgba(37,99,235,0.4) 0%, rgba(13,148,144,0.4) 50%, rgba(124,58,237,0.4) 100%)' }}
            />

            {steps.map((step) => (
              <div
                key={step.num}
                className="relative flex flex-col items-center text-center rounded-2xl p-8 transition-all duration-300 group"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.background = 'rgba(255,255,255,0.07)'
                  el.style.border = `1px solid ${step.color}40`
                  el.style.transform = 'translateY(-6px)'
                  el.style.boxShadow = `0 20px 60px ${step.glow}`
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.background = 'rgba(255,255,255,0.04)'
                  el.style.border = '1px solid rgba(255,255,255,0.07)'
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = 'none'
                }}
              >
                {/* Step number (subtle) */}
                <span
                  className="absolute top-5 right-6 font-black font-mono text-5xl leading-none select-none"
                  style={{ color: 'rgba(255,255,255,0.04)' }}
                >
                  {step.num}
                </span>

                {/* Icon circle */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative z-10"
                  style={{
                    background: step.gradient,
                    boxShadow: `0 8px 32px ${step.glow}`,
                  }}
                >
                  <span className="text-white">{step.icon}</span>
                </div>

                {/* Step label */}
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: step.color }}
                >
                  Step {step.num}
                </div>

                <h3
                  className="font-bold text-xl mb-3"
                  style={{ color: 'white' }}
                >
                  {step.title}
                </h3>

                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why GeoSRM ────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: '#f0f4ff' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label">Why GeoSRM?</p>
            <h2 className="text-3xl font-bold" style={{ color: '#0f1233', letterSpacing: '-0.02em' }}>
              Purpose-built for satellite imagery
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card p-7 hover:shadow-lg transition-all hover:-translate-y-1">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(13,148,144,0.09)' }}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: '#0f1233' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases ─────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label">Use Cases</p>
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#0f1233', letterSpacing: '-0.02em' }}>
              Making Satellite Data More Useful
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: '#6b7280' }}>
              Enhance freely available medium-resolution imagery so analysts can inspect finer
              spatial details without depending entirely on expensive commercial high-resolution imagery.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Disaster Response', emoji: '🆘' },
              { label: 'Urban Monitoring', emoji: '🏙️' },
              { label: 'Environmental Monitoring', emoji: '🌿' },
              { label: 'Agricultural Analysis', emoji: '🌾' },
              { label: 'Infrastructure Assessment', emoji: '🛤️' },
            ].map((uc) => (
              <div
                key={uc.label}
                className="card p-5 flex flex-col items-center gap-3 text-center hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <span className="text-3xl">{uc.emoji}</span>
                <span className="text-xs font-semibold" style={{ color: '#0f1233' }}>{uc.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="py-10 px-4 border-t" style={{ borderColor: 'rgba(15,18,51,0.07)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Satellite size={16} style={{ color: '#0d9490' }} />
            <span className="font-bold" style={{ color: '#0f1233' }}>GeoSRM</span>
          </div>
          <p className="text-xs text-center" style={{ color: '#9ca3af' }}>
            © 2026 GeoSRM · Smart India Hackathon · Team 404 Brain Not Found
          </p>
        </div>
      </footer>
    </div>
  )
}
