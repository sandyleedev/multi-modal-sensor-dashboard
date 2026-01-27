type Props = {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onReset: () => void
}

export function SearchBar({ value, onChange, onSubmit, onReset }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit()
        }}
        placeholder="Search by title or summary..."
        style={{
          flex: 1,
          padding: '10px 12px',
          border: '1px solid #ddd',
          borderRadius: 10,
          outline: 'none',
        }}
      />

      <button
        onClick={onSubmit}
        style={{
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid #111',
          background: '#111',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Search
      </button>

      <button
        onClick={onReset}
        style={{
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid #ddd',
          background: '#fff',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Reset
      </button>
    </div>
  )
}
