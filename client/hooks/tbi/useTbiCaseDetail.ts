'use client'

import { useEffect, useState } from 'react'
import type { CaseItem } from '@/types/tbi.types'

type Args = {
  apiBase: string
  caseId: number | null
  initialCase?: CaseItem | null
}

export function useTbiCaseDetail({ apiBase, caseId, initialCase }: Args) {
  const [data, setData] = useState<CaseItem | null>(initialCase ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setData(initialCase ?? null)
  }, [initialCase])

  useEffect(() => {
    let cancelled = false

    async function fetchDetail(id: number) {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`${apiBase}/tbi/cases/${id}`, { cache: 'no-store' })
        if (res.status === 404) {
          if (!cancelled) {
            setData(null)
            setError('Case not found.')
          }
          return
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch case (${res.status})`)
        }
        const json = (await res.json()) as CaseItem
        if (!cancelled) setData(json)
      } catch (e) {
        console.error(e)
        if (!cancelled) setError('Failed to load case details.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (!caseId) return
    fetchDetail(caseId)

    return () => {
      cancelled = true
    }
  }, [apiBase, caseId])

  return { data, loading, error }
}
