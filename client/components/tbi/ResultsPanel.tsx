import type { CaseItem, CasesResponse } from '@/types/tbi.types'

type Props = {
  casesData: CasesResponse | null
  loading: boolean
  errorMessage: string | null
  onPrev: () => void
  onNext: () => void
  onOpenCase: (item: CaseItem) => void
}

export function ResultsPanel({
  casesData,
  loading,
  errorMessage,
  onPrev,
  onNext,
  onOpenCase,
}: Props) {
  return (
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
      {loading ? (
        <div style={{ color: '#666', fontSize: 14 }}>Loading cases...</div>
      ) : (
        <>
          {/* Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            {casesData?.items?.length ? (
              casesData.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onOpenCase(item)}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: 14,
                    padding: 14,
                    background: '#fff',
                    cursor: 'pointer',
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
              onClick={onPrev}
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
              onClick={onNext}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #ddd',
                background: '#fff',
                cursor:
                  casesData && casesData.page < casesData.totalPages ? 'pointer' : 'not-allowed',
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
  )
}
