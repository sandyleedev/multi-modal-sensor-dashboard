function SkeletonRow({ width = '70%' }: { width?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          background: '#eee',
          flexShrink: 0,
        }}
      />
      <div
        style={{
          height: 12,
          width,
          borderRadius: 999,
          background: '#eee',
        }}
      />
    </div>
  )
}

export function FilterPanelSkeleton() {
  return (
    <>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Scenario</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SkeletonRow width="55%" />
          <SkeletonRow width="72%" />
          <SkeletonRow width="60%" />
          <SkeletonRow width="68%" />
          <SkeletonRow width="50%" />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Technology</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SkeletonRow width="52%" />
          <SkeletonRow width="66%" />
          <SkeletonRow width="58%" />
          <SkeletonRow width="74%" />
          <SkeletonRow width="48%" />
        </div>
      </div>
    </>
  )
}
