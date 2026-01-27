import type { CategoriesResponse } from '@/types/tbi.types'

type Props = {
  categories: CategoriesResponse
  loading: boolean
  selectedScenarios: Set<string>
  selectedTechnologies: Set<string>
  onToggleScenario: (name: string) => void
  onToggleTechnology: (name: string) => void
}

export function FilterPanel({
  categories,
  loading,
  selectedScenarios,
  selectedTechnologies,
  onToggleScenario,
  onToggleTechnology,
}: Props) {
  const scenarioList = categories['scenario'] ?? []
  const techList = categories['technology'] ?? []

  return (
    <aside
      style={{
        border: '1px solid #eee',
        borderRadius: 14,
        padding: 14,
        background: '#fff',
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Filters</div>
        <div style={{ color: '#666', fontSize: 13 }}>Select categories to filter results.</div>
      </div>

      {loading ? (
        <div style={{ color: '#666', fontSize: 14 }}>Loading categories...</div>
      ) : (
        <>
          {/* Scenario */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Scenario</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {scenarioList.length === 0 ? (
                <div style={{ color: '#999', fontSize: 13 }}>No scenario categories</div>
              ) : (
                scenarioList.map((c) => (
                  <label
                    key={c.id}
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      fontSize: 14,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedScenarios.has(c.name)}
                      onChange={() => onToggleScenario(c.name)}
                    />
                    <span>{c.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Technology */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Technology</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {techList.length === 0 ? (
                <div style={{ color: '#999', fontSize: 13 }}>No technology categories</div>
              ) : (
                techList.map((c) => (
                  <label
                    key={c.id}
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      fontSize: 14,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTechnologies.has(c.name)}
                      onChange={() => onToggleTechnology(c.name)}
                    />
                    <span>{c.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </aside>
  )
}
