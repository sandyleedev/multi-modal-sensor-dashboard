'use client'

type Props = {
  lines?: number // default 4
}

export function CaseDetailSkeleton({ lines = 4 }: Props) {
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* first line - longer */}
        <div style={{ ...barStyle, width: '92%' }} />

        {/* middle lines */}
        {Array.from({ length: Math.max(lines - 2, 0) }).map((_, i) => (
          <div key={i} style={{ ...barStyle, width: `${80 - i * 6}%` }} />
        ))}

        {/* last line - short */}
        {lines >= 2 ? <div style={{ ...barStyle, width: '55%' }} /> : null}
      </div>
    </div>
  )
}

const barStyle: React.CSSProperties = {
  height: 14,
  borderRadius: 10,
  backgroundImage: 'linear-gradient(90deg, #f2f2f2 0px, #e9e9e9 40px, #f2f2f2 80px)',
  backgroundSize: '500px 100%',
}
