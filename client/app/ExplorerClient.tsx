'use client'

import { useTbiQueryState } from '@/hooks/tbi/useTbiQueryState'
import { useTbiCategories } from '@/hooks/tbi/useTbiCategories'
import { useTbiCases } from '@/hooks/tbi/useTbiCases'
import { DEFAULT_PAGE_SIZE as PAGE_SIZE } from '@/lib/tbi/query'
import { getApiBase } from '@/lib/config'

export default function ExplorerClient() {
  const {
    urlQ,
    urlPage,
    urlScenario,
    urlTechnology,

    selectedScenarioArr,
    selectedTechnologyArr,
    selectedScenarios,
    selectedTechnologies,
    hasAnyFilters,

    searchInput,
    setSearchInput,

    applySearch,
    goToPage,
    toggleScenario,
    toggleTechnology,
    removeScenario,
    removeTechnology,
    clearSearchOnly,
    clearAllFilters,
  } = useTbiQueryState({ pageSize: PAGE_SIZE })

  const API_BASE = getApiBase()

  const {
    categories,
    loading: loadingCategories,
    error: categoriesError,
  } = useTbiCategories(API_BASE)

  const {
    casesData,
    loading: loadingCases,
    error: casesError,
  } = useTbiCases({
    apiBase: API_BASE,
    q: urlQ,
    scenario: urlScenario,
    technology: urlTechnology,
    page: urlPage,
    pageSize: PAGE_SIZE,
  })

  const errorMessage = categoriesError ?? casesError

  /**
   * -------------------------------------------
   * UI
   * -------------------------------------------
   */
  const scenarioList = categories['scenario'] ?? []
  const techList = categories['technology'] ?? []

  return (
    <main style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Temperature-Based Interaction Explorer</h1>
        <p style={{ color: '#666', margin: 0 }}>
          Search, filter, and explore temperature-based interaction technologies and application
          scenarios.
        </p>
      </div>

      {/* Top Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') applySearch()
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
          onClick={applySearch}
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
          onClick={clearAllFilters}
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

      {/* Selected Filters (Chips) */}
      <div style={{ marginBottom: 16, minHeight: 36, display: 'flex', alignItems: 'center' }}>
        {!hasAnyFilters ? (
          <div style={{ color: '#777', fontSize: 13 }}>No filters applied.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {/* Search chip */}
            {urlQ.trim().length > 0 && (
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
                  {urlQ}
                </span>
                <button
                  onClick={clearSearchOnly}
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
                  onClick={() => removeScenario(s)}
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
                  onClick={() => removeTechnology(t)}
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
              onClick={clearAllFilters}
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

      {/* Layout: Filters (Left) + Results (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 16,
          alignItems: 'start',
        }}
      >
        {/* Left: Filters */}
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

          {loadingCategories ? (
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
                          onChange={() => toggleScenario(c.name)}
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
                          onChange={() => toggleTechnology(c.name)}
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

        {/* Right: Results */}
        <section
          style={{
            border: '1px solid #eee',
            borderRadius: 14,
            padding: 14,
            background: '#fff',
            minHeight: 380,
          }}
        >
          {/* Status / Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontWeight: 700 }}>Results</div>
            <div style={{ color: '#666', fontSize: 13 }}>
              {casesData ? (
                <>
                  {casesData.total} items · Page {casesData.page} / {casesData.totalPages}
                </>
              ) : (
                '—'
              )}
            </div>
          </div>

          {/* Error */}
          {errorMessage && (
            <div
              style={{
                padding: 12,
                borderRadius: 12,
                border: '1px solid #ffd5d5',
                background: '#fff5f5',
                color: '#b00020',
                marginBottom: 12,
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Loading */}
          {loadingCases ? (
            <div style={{ color: '#666', fontSize: 14 }}>Loading cases...</div>
          ) : (
            <>
              {/* Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                {casesData?.items?.length ? (
                  casesData.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        border: '1px solid #eee',
                        borderRadius: 14,
                        padding: 14,
                        background: '#fff',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 16, fontWeight: 700 }}>{item.title}</div>
                          <div style={{ marginTop: 6, color: '#555', fontSize: 14 }}>
                            {item.summary}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 13, color: '#666' }}>{item.year ?? '—'}</div>
                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-block',
                                marginTop: 6,
                                fontSize: 13,
                                color: '#111',
                                textDecoration: 'underline',
                              }}
                            >
                              Open link
                            </a>
                          ) : null}
                        </div>
                      </div>

                      {/* Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                        {(item.tags?.scenario ?? []).map((t) => (
                          <span
                            key={`s-${item.id}-${t}`}
                            style={{
                              fontSize: 12,
                              padding: '4px 8px',
                              borderRadius: 999,
                              border: '1px solid #e6e6e6',
                              background: '#fafafa',
                            }}
                          >
                            Scenario: {t}
                          </span>
                        ))}

                        {(item.tags?.technology ?? []).map((t) => (
                          <span
                            key={`t-${item.id}-${t}`}
                            style={{
                              fontSize: 12,
                              padding: '4px 8px',
                              borderRadius: 999,
                              border: '1px solid #e6e6e6',
                              background: '#fafafa',
                            }}
                          >
                            Tech: {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#666', fontSize: 14 }}>
                    No results found. Try adjusting filters or search keywords.
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: '1px solid #eee',
                }}
              >
                <button
                  disabled={!casesData || casesData.page <= 1}
                  onClick={() => goToPage(Math.max(1, (casesData?.page ?? 1) - 1))}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid #ddd',
                    background: '#fff',
                    cursor: casesData && casesData.page > 1 ? 'pointer' : 'not-allowed',
                    opacity: casesData && casesData.page > 1 ? 1 : 0.5,
                    fontWeight: 600,
                  }}
                >
                  Prev
                </button>

                <div style={{ color: '#666', fontSize: 13 }}>
                  {casesData ? `Page ${casesData.page} of ${casesData.totalPages}` : '—'}
                </div>

                <button
                  disabled={!casesData || casesData.page >= casesData.totalPages}
                  onClick={() =>
                    goToPage(Math.min(casesData?.totalPages ?? 1, (casesData?.page ?? 1) + 1))
                  }
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid #ddd',
                    background: '#fff',
                    cursor:
                      casesData && casesData.page < casesData.totalPages
                        ? 'pointer'
                        : 'not-allowed',
                    opacity: casesData && casesData.page < casesData.totalPages ? 1 : 0.5,
                    fontWeight: 600,
                  }}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
