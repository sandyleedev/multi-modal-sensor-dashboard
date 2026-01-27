type Props = {
  q: string
  hasAnyFilters: boolean
  selectedScenarioArr: string[]
  selectedTechnologyArr: string[]
  onClearSearchOnly: () => void
  onRemoveScenario: (name: string) => void
  onRemoveTechnology: (name: string) => void
  onClearAll: () => void
}

export function SelectedChips({
  q,
  hasAnyFilters,
  selectedScenarioArr,
  selectedTechnologyArr,
  onClearSearchOnly,
  onRemoveScenario,
  onRemoveTechnology,
  onClearAll,
}: Props) {
  return (
    <div style={{ marginBottom: 16, minHeight: 36, display: 'flex', alignItems: 'center' }}>
      {!hasAnyFilters ? (
        <div style={{ color: '#777', fontSize: 13 }}>No filters applied.</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {/* Search chip */}
          {q.trim().length > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid #e6e6e6',
                background: '#fafafa',
              }}
            >
              <strong style={{ fontWeight: 700 }}>Search:</strong>
              <span
                style={{
                  maxWidth: 260,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {q}
              </span>
              <button
                onClick={onClearSearchOnly}
                aria-label="Remove search"
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1,
                  fontSize: 14,
                }}
              >
                ×
              </button>
            </span>
          )}

          {/* Scenario chips */}
          {selectedScenarioArr.map((s) => (
            <span
              key={`chip-s-${s}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid #e6e6e6',
                background: '#fff',
              }}
            >
              <span style={{ fontWeight: 700 }}>Scenario</span>
              <span>{s}</span>
              <button
                onClick={() => onRemoveScenario(s)}
                aria-label={`Remove scenario ${s}`}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1,
                  fontSize: 14,
                }}
              >
                ×
              </button>
            </span>
          ))}

          {/* Technology chips */}
          {selectedTechnologyArr.map((t) => (
            <span
              key={`chip-t-${t}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid #e6e6e6',
                background: '#fff',
              }}
            >
              <span style={{ fontWeight: 700 }}>Tech</span>
              <span>{t}</span>
              <button
                onClick={() => onRemoveTechnology(t)}
                aria-label={`Remove technology ${t}`}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1,
                  fontSize: 14,
                }}
              >
                ×
              </button>
            </span>
          ))}

          {/* Clear all */}
          <button
            onClick={onClearAll}
            style={{
              marginLeft: 4,
              padding: '7px 10px',
              borderRadius: 10,
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
