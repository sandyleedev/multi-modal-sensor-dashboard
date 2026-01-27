import type { CategoriesResponse, CasesResponse } from '@/types/tbi.types'

export async function fetchTbiCategories(apiBase: string): Promise<CategoriesResponse> {
  const res = await fetch(`${apiBase}/tbi/categories`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch categories (${res.status})`)
  return (await res.json()) as CategoriesResponse
}

export async function fetchTbiCases(
  apiBase: string,
  params: {
    q: string
    scenario: string[]
    technology: string[]
    page: number
    pageSize: number
  },
): Promise<CasesResponse> {
  const sp = new URLSearchParams()
  if (params.q.trim().length > 0) sp.set('q', params.q.trim())
  for (const s of params.scenario) sp.append('scenario', s)
  for (const t of params.technology) sp.append('technology', t)
  sp.set('page', String(params.page))
  sp.set('pageSize', String(params.pageSize))

  const res = await fetch(`${apiBase}/tbi/cases?${sp.toString()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch cases (${res.status})`)
  return (await res.json()) as CasesResponse
}
