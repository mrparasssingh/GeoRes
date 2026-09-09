interface StatCardProps {
  label: string
  value: string
  sub?: string
  accent?: boolean
}

export function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div
      className="card p-5 flex flex-col gap-1"
      style={{ borderTop: accent ? '3px solid #0d9490' : undefined }}
    >
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9ca3af' }}>
        {label}
      </span>
      <span className="text-xl font-bold" style={{ color: '#0f1233', lineHeight: 1.2 }}>
        {value}
      </span>
      {sub && (
        <span className="text-xs" style={{ color: '#6b7280' }}>
          {sub}
        </span>
      )}
    </div>
  )
}

interface ResultCardProps {
  rows: { label: string; value: string; highlight?: boolean }[]
  title?: string
}

export function ResultCard({ rows, title }: ResultCardProps) {
  return (
    <div className="card p-5">
      {title && (
        <p className="font-semibold text-sm mb-4" style={{ color: '#0f1233' }}>{title}</p>
      )}
      <div className="flex flex-col">
        {rows.map(({ label, value, highlight }) => (
          <div key={label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <span className="text-sm" style={{ color: '#6b7280' }}>{label}</span>
            <span
              className="text-sm font-semibold"
              style={{ color: highlight ? '#0d9490' : '#0f1233' }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
