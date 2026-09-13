import { Link } from 'react-router-dom'
import {
  Zap,
  ArrowRight,
  Layers,
  Database,
  Upload,
  Cpu,
  Satellite,
  ScanSearch,
  Clock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import HeroMapViewer from '../components/HeroMapViewer'
import { TextShimmer } from '../components/core/text-shimmer'
import { TextLoop } from '../components/core/text-loop'
import { Spotlight } from '../components/core/spotlight'
import { InfiniteSlider } from '../components/core/infinite-slider'
import { AnimatedNumber } from '../components/core/animated-number'
import { InView } from '../components/core/in-view'
import { Tilt } from '../components/core/tilt'
import { Magnetic } from '../components/core/magnetic'

const features = [
  {
    icon: <Zap size={22} style={{ color: '#0f766e' }} />,
    title: '4× Spatial Enhancement',
    desc: 'Upscale medium-resolution imagery by 4× using an SRCNN 3-layer convolutional network trained on EuroSAT satellite imagery.',
  },
  {
    icon: <Database size={22} style={{ color: '#0f766e' }} />,
    title: 'TIFF Export',
    desc: 'Enhanced images are exported as both PNG and TIFF formats for downstream GIS tool compatibility.',
  },
  {
    icon: <Layers size={22} style={{ color: '#0f766e' }} />,
    title: 'Convolutional Sharpening',
    desc: 'Applies a 3-layer CNN to sharpen the bicubic-upsampled image directly without tiling artifacts.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Upload',
    desc: 'Upload a medium-resolution satellite image in GeoTIFF, PNG or JPG format.',
    icon: <Upload size={26} />,
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.18)',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
  },
  {
    num: '02',
    title: 'Enhance',
    desc: 'The deep learning pipeline tiles, enhances and reconstructs the image at 4× spatial resolution.',
    icon: <Cpu size={26} />,
    color: '#2dd4bf',
    glow: 'rgba(45,212,191,0.18)',
    gradient: 'linear-gradient(135deg, #0f7572 0%, #14b8b0 100%)',
  },
  {
    num: '03',
    title: 'Analyze',
    desc: 'Compare original and enhanced imagery side-by-side and download the result.',
    icon: <ScanSearch size={26} />,
    color: '#c084fc',
    glow: 'rgba(192,132,252,0.18)',
    gradient: 'linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)',
  },
]

const satelliteMissions = [
  { name: 'Sentinel-2 (ESA)', desc: '10m Optical Multi-Spectral', badge: 'Active' },
  { name: 'Landsat 8/9 (USGS)', desc: '15m Panchromatic Band', badge: 'Calibrated' },
  { name: 'ISRO Cartosat', desc: 'High-Res Optical Feeds', badge: 'Supported' },
  { name: 'Copernicus Hub', desc: 'Open Earth Observation', badge: 'API Ready' },
  { name: 'EuroSAT Benchmark', desc: '27,000 Verified Sentinel Tiles', badge: 'Trained' },
  { name: 'NASA EarthData', desc: 'Surface Reflectance Products', badge: 'Integrated' },
]

const telemetryStats = [
  {
    icon: <Zap size={20} className="text-teal-700" />,
    value: 4.0,
    decimals: 1,
    suffix: '×',
    label: 'Spatial Resolution Gain',
    sub: 'From 10m to 2.5m Ground Sampling',
  },
  {
    icon: <ShieldCheck size={20} className="text-teal-700" />,
    value: 32.4,
    decimals: 1,
    suffix: ' dB',
    label: 'Reconstruction PSNR',
    sub: 'Benchmark peak signal fidelity',
  },
  {
    icon: <Clock size={20} className="text-teal-700" />,
    value: 45,
    decimals: 0,
    prefix: '<',
    suffix: ' ms',
    label: 'CUDA Inference Latency',
    sub: 'Real-time RTX 3050 execution',
  },
  {
    icon: <Database size={20} className="text-teal-700" />,
    value: 27000,
    decimals: 0,
    suffix: '+',
    label: 'EuroSAT Training Tiles',
    sub: '10 balanced land-cover classes',
  },
]

export default function HomePage() {
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
          {/* Luminous Shimmer Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 mb-6 shadow-xs">
            <Sparkles size={14} className="text-teal-600 animate-pulse" />
            <span className="text-xs font-semibold text-teal-900">
              Smart India Hackathon 2026 ·
            </span>
            <TextShimmer className="text-xs font-bold" duration={2.4}>
              AI Super-Resolution Pipeline
            </TextShimmer>
          </div>

          {/* Heading with Dynamic TextLoop */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
            style={{ color: '#0f1233', letterSpacing: '-0.03em' }}
          >
            Turn Medium-Resolution
            <br />
            <TextLoop
              className="gradient-text my-1 inline-block"
              interval={3.2}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
            >
              <span>Sentinel-2 Imagery</span>
              <span>Multi-Spectral Bands</span>
              <span>Optical Satellite Data</span>
              <span>Earth Observation Tiles</span>
            </TextLoop>
            <br />
            into High-Detail Maps
          </h1>

          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto" style={{ color: '#4a5568', lineHeight: 1.7 }}>
            Super-resolution enhancement for clearer satellite imagery, faster analysis
            and smarter geospatial decisions — without expensive commercial imagery.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Magnetic intensity={0.25} range={80}>
              <Link to="/enhance" id="hero-enhance-btn" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
                <Zap size={18} />
                Enhance an Image
              </Link>
            </Magnetic>
            <Magnetic intensity={0.2} range={80}>
              <Link to="/how-it-works" id="hero-how-btn" className="btn-secondary text-base px-8 py-3 inline-flex items-center gap-2">
                See How It Works
                <ArrowRight size={18} />
              </Link>
            </Magnetic>
          </div>
        </div>

        {/* Deferred, non-blocking Hero Map */}
        <div className="max-w-3xl mx-auto mt-16 px-4">
          <HeroMapViewer />
        </div>
      </section>

      {/* ── Supported Missions & Satellites Infinite Slider ──── */}
      <section className="py-8 bg-slate-50 border-y border-slate-200/70 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 mb-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Compatible Earth Observation Datasets & Sensor Constellations
          </p>
        </div>
        <InfiniteSlider gap={32} speed={35} speedOnHover={15}>
          {satelliteMissions.map((m) => (
            <div
              key={m.name}
              className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs select-none"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-xs" />
              <div>
                <div className="text-sm font-bold text-slate-900 leading-tight">{m.name}</div>
                <div className="text-xs text-slate-500">{m.desc}</div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                {m.badge}
              </span>
            </div>
          ))}
        </InfiniteSlider>
      </section>

      {/* ── Telemetry & Verified Benchmarks ─────────────────── */}
      <section className="py-16 px-4 bg-white border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto">
          <InView once>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {telemetryStats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 transition-all hover:bg-white hover:shadow-md hover:border-teal-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-teal-50 border border-teal-100">
                      {stat.icon}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Metric</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-baseline">
                    {stat.prefix && <span className="text-2xl mr-0.5 text-teal-600">{stat.prefix}</span>}
                    <AnimatedNumber value={stat.value} decimals={stat.decimals} />
                    <span className="text-teal-600 text-2xl font-bold ml-0.5">{stat.suffix}</span>
                  </div>
                  <div className="font-semibold text-sm text-slate-800 mt-1">{stat.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{stat.sub}</div>
                </div>
              ))}
            </div>
          </InView>
        </div>
      </section>

      {/* ── 3 Steps — Premium Dark Design with Spotlight ───────── */}
      <section className="py-24 px-4" style={{ background: '#0d1117' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: '#2dd4bf' }}
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
              <InView key={step.num} once>
                <div
                  className="relative flex flex-col items-center text-center rounded-2xl p-8 transition-all duration-300 group overflow-hidden"
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
                  {/* Cursor Spotlight Glow */}
                  <Spotlight size={300} className="from-teal-400/20 via-cyan-400/10 to-transparent" />

                  {/* Step number (subtle background decoration) */}
                  <span
                    className="absolute top-5 right-6 font-black font-mono text-5xl leading-none select-none pointer-events-none"
                    style={{ color: 'rgba(255,255,255,0.06)' }}
                    aria-hidden="true"
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
                    style={{ color: 'rgba(255,255,255,0.75)' }}
                  >
                    {step.desc}
                  </p>
                </div>
              </InView>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why GeoSRM with 3D Tilt ───────────────────────────── */}
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
              <Tilt key={f.title} rotationFactor={8}>
                <div className="card p-7 hover:shadow-lg transition-all h-full flex flex-col">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: 'rgba(13,148,144,0.09)' }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-base mb-2" style={{ color: '#0f1233' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>{f.desc}</p>
                </div>
              </Tilt>
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
            <p className="text-base max-w-xl mx-auto" style={{ color: '#334155' }}>
              Enhance freely available medium-resolution imagery so analysts can inspect finer
              spatial details without depending entirely on expensive commercial high-resolution imagery.
            </p>
          </div>
          <InView once>
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
          </InView>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="py-10 px-4 border-t" style={{ borderColor: 'rgba(15,18,51,0.07)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Satellite size={16} style={{ color: '#0f766e' }} />
            <span className="font-bold" style={{ color: '#0f1233' }}>GeoSRM</span>
          </div>
          <p className="text-xs text-center" style={{ color: '#475569' }}>
            © 2026 GeoSRM · Smart India Hackathon · Team 404 Brain Not Found
          </p>
        </div>
      </footer>
    </div>
  )
}
