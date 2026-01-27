export function SkeletonCard() {
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 14, padding: 14 }}>
      <div style={{ height: 16, width: '60%', background: '#eee', borderRadius: 8 }} />
      <div
        style={{ height: 12, width: '90%', background: '#eee', borderRadius: 8, marginTop: 10 }}
      />
      <div
        style={{ height: 12, width: '75%', background: '#eee', borderRadius: 8, marginTop: 8 }}
      />
      <div
        style={{ height: 20, width: '45%', background: '#eee', borderRadius: 999, marginTop: 12 }}
      />
    </div>
  )
}
