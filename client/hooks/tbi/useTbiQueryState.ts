import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { buildQueryString } from '@/lib/tbi/query'

type Options = {
  pageSize: number
}

export function useTbiQueryState({ pageSize }: Options) {
  const router = useRouter()
  const searchParams = useSearchParams()

  /**
   * -------------------------------------------
   * 1) URL(Query String) -> parse current state
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
   * 2) UI state
   * - The search input is not applied to the URL immediately.
   * - It is reflected in the URL only when the user clicks the Apply button (or presses Enter).
   * -------------------------------------------
   */
  const [searchInput, setSearchInput] = useState(urlQ)

  // sync input when URL q changes (back/forward navigation)
  useEffect(() => {
    setSearchInput(urlQ)
  }, [urlQ])

  /**
   * -------------------------------------------
   * 3) Derived sets for checkbox UI
   * -------------------------------------------
   */
  const selectedScenarios = useMemo(() => new Set(urlScenario), [urlScenario.join('|')])
  const selectedTechnologies = useMemo(() => new Set(urlTechnology), [urlTechnology.join('|')])

  /**
   * -------------------------------------------
   * 4) URL update helper
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
      page: next.page ?? 1,
      pageSize: pageSize,
    })
    router.push(`/${qs}`)
  }

  /**
   * -------------------------------------------
   * 5) Action handlers
   * -------------------------------------------
   */
  function applySearch() {
    updateUrl({
      q: searchInput,
      page: 1,
    })
  }

  function goToPage(p: number) {
    updateUrl({ page: p })
  }

  function toggleScenario(name: string) {
    const next = new Set(urlScenario)
    if (next.has(name)) {
      next.delete(name)
    } else {
      next.add(name)
    }

    updateUrl({
      scenario: Array.from(next),
      page: 1,
    })
  }

  function toggleTechnology(name: string) {
    const next = new Set(urlTechnology)
    if (next.has(name)) {
      next.delete(name)
    } else {
      next.add(name)
    }

    updateUrl({
      technology: Array.from(next),
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

  function clearAllFilters() {
    updateUrl({
      q: '',
      scenario: [],
      technology: [],
      page: 1,
    })
  }

  return {
    // raw URL states (for fetch hooks)
    urlQ,
    urlPage,
    urlScenario,
    urlTechnology,

    // derived
    selectedScenarioArr,
    selectedTechnologyArr,
    selectedScenarios,
    selectedTechnologies,
    hasAnyFilters,

    // search input
    searchInput,
    setSearchInput,

    // actions
    updateUrl,
    applySearch,
    goToPage,
    toggleScenario,
    toggleTechnology,
    removeScenario,
    removeTechnology,
    clearSearchOnly,
    clearAllFilters,
  }
}
