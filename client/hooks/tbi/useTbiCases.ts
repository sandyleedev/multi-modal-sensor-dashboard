'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CasesResponse } from '@/types/tbi.types'
import { fetchTbiCases } from '@/lib/tbi/api'

export function useTbiCases(args: {
  apiBase: string
  q: string
  scenario: string[]
  technology: string[]
  page: number
  pageSize: number
}) {
  const [casesData, setCasesData] = useState<CasesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const scenarioKey = useMemo(() => args.scenario.join('|'), [args.scenario.join('|')])
  const technologyKey = useMemo(() => args.technology.join('|'), [args.technology.join('|')])

  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchTbiCases(args.apiBase, {
          q: args.q,
          scenario: args.scenario,
          technology: args.technology,
          page: args.page,
          pageSize: args.pageSize,
        })
        if (!cancelled) setCasesData(data)
      } catch (e) {
        console.error(e)
        if (!cancelled) setError('Failed to load cases.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [args.apiBase, args.q, scenarioKey, technologyKey, args.page, args.pageSize])

  return { casesData, loading, error }
}
