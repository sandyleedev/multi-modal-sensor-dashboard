'use client'

import { useEffect, useState } from 'react'
import type { CategoriesResponse } from '@/types/tbi.types'
import { fetchTbiCategories } from '@/lib/tbi/api'

export function useTbiCategories(apiBase: string) {
  const [categories, setCategories] = useState<CategoriesResponse>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchTbiCategories(apiBase)
        if (!cancelled) setCategories(data)
      } catch (e) {
        console.error(e)
        if (!cancelled) setError('Failed to load categories.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [apiBase])

  return { categories, loading, error }
}
