import { Link } from 'react-router-dom'
import { ArrowDown, Zap, Database, Server, Code2 } from 'lucide-react'

const pipelineSteps = [
  { label: 'Satellite Image Input', sub: 'GeoTIFF (Sentinel-2 10 m) · PNG · JPG' },
  { label: 'Metadata Extraction', sub: 'CRS · EPSG · Band info via Rasterio / GDAL' },
  { label: '512×512 Overlapping Tiles', sub: 'Tiling with configurable stride and overlap' },
  { label: 'SwinIR AI Enhancement', sub: 'Transformer-based deep learning super-resolution' },
  { label: '4× Super Resolution', sub: 'Each tile upscaled from ~512 → ~2048 px' },
  { label: 'Gaussian Weighted Seam-Free Reconstruction', sub: 'Weighted blending eliminates tile seam artifacts' },
  { label: 'Enhanced GeoTIFF Output', sub: 'Metadata re-attached · CRS preserved' },
  { label: 'Interactive Comparison', sub: 'Before / after slider · zoom · download' },
]

const techCards = [
  {
    name: 'SwinIR',
    icon: <Zap size={20} style={{ color: '#0d9490' }} />,
    desc: 'Swin Transformer-based image restoration and super-resolution. Used as the core deep learning model for enhancing spatial detail.',
    status: 'Core Model',
    statusColor: '#0d9490',
  },
  {
    name: 'GDAL + Rasterio',
    icon: <Database size={20} style={{ color: '#0d9490' }} />,
    desc: 'Geospatial raster processing libraries. Handle GeoTIFF I/O, CRS/EPSG metadata extraction and preservation throughout the pipeline.',
    status: 'Geospatial Layer',
    statusColor: '#0d9490',
  },
  {
    name: 'FastAPI',
    icon: <Server size={20} style={{ color: '#0d9490' }} />,
    desc: 'High-performance Python API backend. Serves the enhancement API endpoints and manages Celery job queuing for large images.',
    status: 'Planned Backend',
    statusColor: '#d97706',
  },
]

const stackItems = [
  { group: 'AI / Model', items: ['Python', 'PyTorch', 'SwinIR', 'Real-ESRGAN (planned)', 'OpenCV'], color: '#0d9490' },
  { group: 'Geospatial', items: ['GDAL', 'Rasterio', 'GeoPandas'], color: '#1e2461' },
  { group: 'Backend', items: ['FastAPI', 'Celery', 'Redis', 'Docker', 'CUDA (GPU)'], color: '#7c3aed' },
  { group: 'Frontend', items: ['React', 'TypeScript', 'Vite', 'Leaflet / OpenLayers'], color: '#0f1233' },
]

export default function HowItWorksPage() {
  return (
    <div className="pt-16 min-h-screen" style={{ background: '#fafbff' }}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-14 animate-slide-up">
          <p className="section-label">Architecture</p>
          <h1 className="text-3xl font-bold mb-3" style={{ color: '#0f1233', letterSpacing: '-0.02em' }}>
            How GeoSRM Works
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#6b7280' }}>
            A deep learning pipeline that transforms medium-resolution satellite imagery into
            high-detail enhanced outputs — preserving all geospatial metadata.
          </p>
        </div>

        {/* ── Pipeline ── */}
        <section className="mb-16">
          <p className="section-label text-center mb-8">Enhancement Pipeline</p>
          <div className="flex flex-col items-center gap-0">
            {pipelineSteps.map((step, i) => (
              <div key={step.label} className="flex flex-col items-center w-full max-w-lg">
                <div
                  className="w-full card px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 hover:shadow-lg transition-shadow"
                  style={{
                    borderLeft: i === 3 ? '4px solid #0d9490' : '4px solid transparent',
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold font-mono"
                        style={{ color: 'rgba(13,148,144,0.6)' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="font-semibold text-sm" style={{ color: '#0f1233' }}>{step.label}</p>
                    </div>
                    <p className="text-xs mt-0.5 ml-7" style={{ color: '#9ca3af' }}>{step.sub}</p>
                  </div>
                  {i === 3 && (
                    <span className="badge badge-teal self-start sm:self-center flex-shrink-0">Core AI</span>
                  )}
                </div>
                {i < pipelineSteps.length - 1 && (
                  <div className="flex flex-col items-center py-1">
                    <ArrowDown size={18} style={{ color: '#0d9490', opacity: 0.5 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Tech Cards ── */}
        <section className="mb-16">
          <p className="section-label text-center mb-8">Key Technologies</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {techCards.map((t) => (
              <div key={t.name} className="card p-6 hover:shadow-lg transition-all hover:-translate-y-0.5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(13,148,144,0.08)' }}>
                    {t.icon}
                  </div>
                  <div>
                    <p className="font-bold text-base" style={{ color: '#0f1233' }}>{t.name}</p>
                    <span
                      className="badge text-xs px-2 py-0.5"
                      style={{ background: `${t.statusColor}15`, color: t.statusColor }}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Full Tech Stack ── */}
        <section className="mb-12">
          <p className="section-label text-center mb-8">Full Technology Stack</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stackItems.map((group) => (
              <div key={group.group} className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Code2 size={14} style={{ color: group.color }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: group.color }}>
                    {group.group}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {group.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{
                        background: `${group.color}08`,
                        color: '#0f1233',
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: group.color }} />
                      {item}
                      {item.includes('planned') && (
                        <span className="ml-auto text-xs" style={{ color: '#d97706' }}>planned</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-center mt-4" style={{ color: '#9ca3af' }}>
            Technologies marked "planned" are part of the project architecture but not yet deployed in the current demo.
          </p>
        </section>

        {/* ── API Endpoints ── */}
        <section className="mb-12">
          <p className="section-label text-center mb-6">Backend API Architecture</p>
          <div className="card p-6">
            <p className="text-sm font-semibold mb-4" style={{ color: '#0f1233' }}>FastAPI Endpoints</p>
            <div className="flex flex-col gap-3">
              {[
                { method: 'POST', path: '/api/enhance', desc: 'Submit an image for enhancement — returns a job ID' },
                { method: 'GET', path: '/api/jobs/{job_id}', desc: 'Poll job status and current processing step' },
                { method: 'GET', path: '/api/results/{job_id}', desc: 'Retrieve completed enhancement result URLs' },
              ].map((ep) => (
                <div key={ep.path} className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: '#f0f4ff' }}>
                  <span
                    className="font-mono text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0"
                    style={{
                      background: ep.method === 'POST' ? '#0d9490' : '#1e2461',
                      color: 'white',
                    }}
                  >
                    {ep.method}
                  </span>
                  <div>
                    <p className="font-mono text-xs font-semibold" style={{ color: '#0f1233' }}>{ep.path}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{ep.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link to="/enhance" id="hiw-enhance-btn" className="btn-primary text-base px-8 py-3">
            <Zap size={18} />
            Try the Enhancement Pipeline
          </Link>
        </div>
      </div>
    </div>
  )
}
