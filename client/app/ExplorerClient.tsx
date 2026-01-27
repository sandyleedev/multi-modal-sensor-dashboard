'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import type { CaseItem } from '@/types/tbi.types'
import { getApiBase } from '@/lib/config'
import { DEFAULT_PAGE_SIZE as PAGE_SIZE } from '@/lib/tbi/query'

import { useTbiQueryState } from '@/hooks/tbi/useTbiQueryState'
import { useTbiCategories } from '@/hooks/tbi/useTbiCategories'
import { useTbiCases } from '@/hooks/tbi/useTbiCases'
import { useTbiCaseDetail } from '@/hooks/tbi/useTbiCaseDetail'

import { ExplorerHeader } from '@/components/tbi/ExplorerHeader'
import { SearchBar } from '@/components/tbi/SearchBar'
import { SelectedChips } from '@/components/tbi/SelectedChips'
import { FilterPanel } from '@/components/tbi/FilterPanel'
import { ResultsPanel } from '@/components/tbi/ResultsPanel'
import { CaseDetailModal } from '@/components/tbi/CaseDetailModal'

export default function ExplorerClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const API_BASE = getApiBase()

  /**
   * URL state: caseId (deep-link support)
   */
  const urlCaseIdStr = searchParams.get('caseId')
  const caseId = urlCaseIdStr ? Number(urlCaseIdStr) : null
  const normalizedCaseId =
    Number.isFinite(caseId) && (caseId as number) > 0 ? (caseId as number) : null

  /**
   * Optimistic modal content (from the list item) while fetching full details.
   */
  const [initialCase, setInitialCase] = useState<CaseItem | null>(null)

  /**
   * URL state: search/filter/pagination
   */
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

  /**
   * Data: categories + cases list
   */
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

  /**
   * If a user lands on a deep-link, try to reuse the current page item as initial content.
   */
  const caseMap = useMemo(() => {
    const m = new Map<number, CaseItem>()
    for (const it of casesData?.items ?? []) m.set(it.id, it)
    return m
  }, [casesData?.items])

  const initialFromPage = normalizedCaseId ? (caseMap.get(normalizedCaseId) ?? null) : null

  /**
   * Data: selected case detail (single source of truth for the modal)
   */
  const {
    data: selectedCase,
    loading: loadingDetail,
    error: detailError,
  } = useTbiCaseDetail({
    apiBase: API_BASE,
    caseId: normalizedCaseId,
    initialCase: initialCase ?? initialFromPage,
  })

  /**
   * Handlers: open/close modal via URL
   */
  function openCase(item: CaseItem) {
    // Show something immediately, then `useTbiCaseDetail` will replace with full data.
    setInitialCase(item)

    const sp = new URLSearchParams(searchParams.toString())
    sp.set('caseId', String(item.id))
    router.push(`/?${sp.toString()}`, { scroll: false })
  }

  function closeCase() {
    setInitialCase(null)

    const sp = new URLSearchParams(searchParams.toString())
    sp.delete('caseId')

    const qs = sp.toString()
    router.push(qs ? `/?${qs}` : '/', { scroll: false })
  }

  const modalOpen = !!normalizedCaseId
  const listErrorMessage = categoriesError ?? casesError

  return (
    <main style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <ExplorerHeader />

      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
        onSubmit={applySearch}
        onReset={clearAllFilters}
      />

      <SelectedChips
        q={urlQ}
        hasAnyFilters={hasAnyFilters}
        selectedScenarioArr={selectedScenarioArr}
        selectedTechnologyArr={selectedTechnologyArr}
        onClearSearchOnly={clearSearchOnly}
        onRemoveScenario={removeScenario}
        onRemoveTechnology={removeTechnology}
        onClearAll={clearAllFilters}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <FilterPanel
          categories={categories}
          loading={loadingCategories}
          selectedScenarios={selectedScenarios}
          selectedTechnologies={selectedTechnologies}
          onToggleScenario={toggleScenario}
          onToggleTechnology={toggleTechnology}
        />

        <ResultsPanel
          casesData={casesData}
          loading={loadingCases}
          errorMessage={listErrorMessage}
          onPrev={() => goToPage(Math.max(1, (casesData?.page ?? 1) - 1))}
          onNext={() => goToPage(Math.min(casesData?.totalPages ?? 1, (casesData?.page ?? 1) + 1))}
          onOpenCase={openCase}
        />
      </div>

      <CaseDetailModal
        open={modalOpen}
        loading={loadingDetail}
        error={detailError}
        caseItem={selectedCase}
        onClose={closeCase}
      />
    </main>
  )
}
