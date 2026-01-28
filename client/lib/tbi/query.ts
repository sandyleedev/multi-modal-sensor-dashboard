export const DEFAULT_PAGE_SIZE = 5

export function buildQueryString(params: {
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
  if (params.pageSize && params.pageSize !== DEFAULT_PAGE_SIZE)
    sp.set('pageSize', String(params.pageSize))

  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}
