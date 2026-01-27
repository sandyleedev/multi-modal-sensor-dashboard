'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { CategoriesResponse, CasesResponse } from '@/types/tbi.types'

const PAGE_SIZE = 12

function buildQueryString(params: {
  q?: string
  scenario?: string[]
  technology?: string[]
  page?: number
  pageSize?: number
}) {
  const sp = new URLSearchParams()

  if (params.q && params.q.trim().length > 0) sp.set('q', params.q.trim())

  for (const s of params.scenario ?? []) sp.append('scenario', s)
  for (const t of params.technology ?? []) sp.append('technology', t)

  if (params.page && params.page > 1) sp.set('page', String(params.page))
  if (params.pageSize && params.pageSize !== PAGE_SIZE) sp.set('pageSize', String(params.pageSize))

  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

export default function ExplorerClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  /**
   * -------------------------------------------
   * 1) URL(Query String) -> 현재 상태 파싱
   * -------------------------------------------
   */
  const urlQ = searchParams.get('q') ?? ''
  const urlPage = Number(searchParams.get('page') ?? '1') || 1
  const urlScenario = searchParams.getAll('scenario')
  const urlTechnology = searchParams.getAll('technology')

  const selectedScenarioArr = useMemo(() => urlScenario, [urlScenario])
  const selectedTechnologyArr = useMemo(() => urlTechnology, [urlTechnology])

  const hasAnyFilters =
    (urlQ?.trim().length ?? 0) > 0 ||
    selectedScenarioArr.length > 0 ||
    selectedTechnologyArr.length > 0

  /**
   * -------------------------------------------
   * 2) UI 상태 (검색 input은 즉시 URL에 반영 안 하고, Apply 버튼으로 반영)
   * -------------------------------------------
   */
  const [searchInput, setSearchInput] = useState(urlQ)

  // URL q가 바뀌면 input도 동기화 (뒤로가기/앞으로가기 대응)
  useEffect(() => {
    setSearchInput(urlQ)
  }, [urlQ])

  /**
   * -------------------------------------------
   * 3) 서버 데이터 상태
   * -------------------------------------------
   */
  const [categories, setCategories] = useState<CategoriesResponse>({})
  const [casesData, setCasesData] = useState<CasesResponse | null>(null)

  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingCases, setLoadingCases] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectedScenarios = useMemo(() => new Set(urlScenario), [urlScenario])
  const selectedTechnologies = useMemo(() => new Set(urlTechnology), [urlTechnology])

  /**
   * -------------------------------------------
   * 4) categories 불러오기
   * -------------------------------------------
   */
  useEffect(() => {
    let cancelled = false
    async function fetchCategories() {
      setLoadingCategories(true)
      setErrorMessage(null)

      try {
        const res = await fetch(`${API_BASE}/tbi/categories`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed to fetch categories (${res.status})`)

        const data = (await res.json()) as CategoriesResponse
        if (!cancelled) setCategories(data)
      } catch (err) {
        if (!cancelled) setErrorMessage('Failed to load categories.')
        console.error(err)
      } finally {
        if (!cancelled) setLoadingCategories(false)
      }
    }

    fetchCategories()
    return () => {
      cancelled = true
    }
  }, [API_BASE])

  /**
   * -------------------------------------------
   * 5) cases 불러오기 (URL 쿼리가 바뀔 때마다 자동 업데이트)
   * -------------------------------------------
   */
  useEffect(() => {
    let cancelled = false
    async function fetchCases() {
      setLoadingCases(true)
      setErrorMessage(null)

      try {
        const sp = new URLSearchParams()

        if (urlQ.trim().length > 0) sp.set('q', urlQ.trim())
        for (const s of urlScenario) sp.append('scenario', s)
        for (const t of urlTechnology) sp.append('technology', t)

        sp.set('page', String(urlPage))
        sp.set('pageSize', String(PAGE_SIZE))

        const res = await fetch(`${API_BASE}/tbi/cases?${sp.toString()}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed to fetch cases (${res.status})`)

        const data = (await res.json()) as CasesResponse
        if (!cancelled) setCasesData(data)
      } catch (err) {
        if (!cancelled) setErrorMessage('Failed to load cases.')
        console.error(err)
      } finally {
        if (!cancelled) setLoadingCases(false)
      }
    }

    fetchCases()
    return () => {
      cancelled = true
    }
  }, [API_BASE, urlQ, urlScenario.join('|'), urlTechnology.join('|'), urlPage])

  /**
   * -------------------------------------------
   * 6) URL 업데이트 유틸 (필터 / 페이지네이션 / 검색)
   * -------------------------------------------
   */
  function updateUrl(next: {
    q?: string
    scenario?: string[]
    technology?: string[]
    page?: number
  }) {
    const qs = buildQueryString({
      q: next.q ?? urlQ,
      scenario: next.scenario ?? urlScenario,
      technology: next.technology ?? urlTechnology,
      page: next.page ?? 1, // 필터/검색 변경 시 기본은 page 1로
      pageSize: PAGE_SIZE,
    })
    router.push(`/${qs}`)
  }

  function toggleScenario(name: string) {
    const next = new Set(urlScenario)
    if (next.has(name)) next.delete(name)
    else next.add(name)

    updateUrl({
      scenario: Array.from(next),
      page: 1,
    })
  }

  function toggleTechnology(name: string) {
    const next = new Set(urlTechnology)
    if (next.has(name)) next.delete(name)
    else next.add(name)

    updateUrl({
      technology: Array.from(next),
      page: 1,
    })
  }

  function clearAllFilters() {
    updateUrl({
      q: '',
      scenario: [],
      technology: [],
      page: 1,
    })
  }

  function removeScenario(name: string) {
    const next = urlScenario.filter((s) => s !== name)
    updateUrl({ scenario: next, page: 1 })
  }

  function removeTechnology(name: string) {
    const next = urlTechnology.filter((t) => t !== name)
    updateUrl({ technology: next, page: 1 })
  }

  function clearSearchOnly() {
    setSearchInput('')
    updateUrl({ q: '', page: 1 })
  }

  function applySearch() {
    updateUrl({
      q: searchInput,
      page: 1,
    })
  }

  function goToPage(p: number) {
    updateUrl({ page: p })
  }

  /**
   * -------------------------------------------
   * 7) UI
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
