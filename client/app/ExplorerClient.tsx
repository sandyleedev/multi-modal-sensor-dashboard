'use client'

import { useTbiQueryState } from '@/hooks/tbi/useTbiQueryState'
import { useTbiCategories } from '@/hooks/tbi/useTbiCategories'
import { useTbiCases } from '@/hooks/tbi/useTbiCases'
import { DEFAULT_PAGE_SIZE as PAGE_SIZE } from '@/lib/tbi/query'
import { getApiBase } from '@/lib/config'
import { ExplorerHeader } from '@/components/tbi/ExplorerHeader'
import { SearchBar } from '@/components/tbi/SearchBar'
import { SelectedChips } from '@/components/tbi/SelectedChips'
import { FilterPanel } from '@/components/tbi/FilterPanel'
import { ResultsPanel } from '@/components/tbi/ResultsPanel'

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
          errorMessage={errorMessage}
          onPrev={() => goToPage(Math.max(1, (casesData?.page ?? 1) - 1))}
          onNext={() => goToPage(Math.min(casesData?.totalPages ?? 1, (casesData?.page ?? 1) + 1))}
        />
      </div>
    </main>
  )
}
