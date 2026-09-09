import { Link } from 'react-router-dom'
import { ArrowDown, Zap, Database, Server, Code2 } from 'lucide-react'

const pipelineSteps = [
  { label: 'Satellite Image Input', sub: 'GeoTIFF · PNG · JPG decoded via Pillow' },
  { label: 'Bicubic Upscaling', sub: 'Upsamples image to target spatial dimensions' },
  { label: 'SRCNN Inference', sub: 'Applies a 3-layer CNN to sharpen the bicubic-upsampled image' },
  { label: 'Tensor Clamping & Format Export', sub: 'Clamps values to [0, 1] and writes PNG / TIFF' },
  { label: 'Interactive Comparison', sub: 'Before / after comparison slider and download' },
]

const techCards = [
  {
    name: 'SRCNN (Super-Resolution CNN)',
    icon: <Zap size={20} style={{ color: '#0d9490' }} />,
    desc: 'Three-layer convolutional neural network (Dong et al.) implemented in PyTorch with AMP. Applies 9×9 and 5×5 filters to refine upsampled satellite imagery.',
    status: 'Active Model',
    statusColor: '#0d9490',
  },
  {
    name: 'Pillow & NumPy',
    icon: <Database size={20} style={{ color: '#0d9490' }} />,
    desc: 'Raster I/O and tensor manipulation libraries. Handle RGB image decoding, array normalization to [0, 1], and TIFF export.',
    status: 'Image Pipeline',
    statusColor: '#0d9490',
  },
  {
    name: 'Python ThreadingHTTPServer',
    icon: <Server size={20} style={{ color: '#0d9490' }} />,
    desc: 'Standard library multithreaded HTTP server serving REST endpoints for image enhancement, job polling, and direct binary downloads.',
    status: 'Active Backend',
    statusColor: '#0d9490',
  },
]

const stackItems = [
  { group: 'AI / Model', items: ['Python', 'PyTorch', 'SRCNN', 'CUDA 12.6', 'Torchvision'], color: '#0d9490' },
  { group: 'Image I/O', items: ['Pillow', 'NumPy', 'GeoTIFF / PNG / JPEG'], color: '#1e2461' },
  { group: 'Backend', items: ['Python http.server', 'ThreadingHTTPServer', 'REST API'], color: '#7c3aed' },
  { group: 'Frontend', items: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Leaflet'], color: '#0f1233' },
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
            <p className="text-sm font-semibold mb-4" style={{ color: '#0f1233' }}>REST API Endpoints</p>
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
