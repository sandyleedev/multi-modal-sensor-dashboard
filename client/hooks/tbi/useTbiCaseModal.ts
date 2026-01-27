'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { CaseItem } from '@/types/tbi.types'
import { useTbiCaseDetail } from '@/hooks/tbi/useTbiCaseDetail'

type Args = {
  apiBase: string
  casesOnPage: CaseItem[]
}

export function useTbiCaseModal({ apiBase, casesOnPage }: Args) {
  const router = useRouter()
  const searchParams = useSearchParams()

  /**
   * URL state: caseId
   */
  const urlCaseIdStr = searchParams.get('caseId')
  const parsed = urlCaseIdStr ? Number(urlCaseIdStr) : null
  const caseId = Number.isFinite(parsed) && (parsed as number) > 0 ? (parsed as number) : null

  /**
   * Optimistic modal content (from list item click)
   */
  const [initialCase, setInitialCase] = useState<CaseItem | null>(null)

  /**
   * If user lands via deep-link, reuse the item on the current page if available
   */
  const caseMap = useMemo(() => {
    const m = new Map<number, CaseItem>()
    for (const it of casesOnPage ?? []) m.set(it.id, it)
    return m
  }, [casesOnPage])

  const initialFromPage = caseId ? (caseMap.get(caseId) ?? null) : null

  /**
   * Single source of truth: always fetch full detail for the modal
   */
  const { data, loading, error } = useTbiCaseDetail({
    apiBase,
    caseId,
    initialCase: initialCase ?? initialFromPage,
  })

  /**
   * Open/close modal by updating URL (keep scroll position)
   */
  function openCase(item: CaseItem) {
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

  return {
    modalOpen: !!caseId,
    caseId,
    selectedCase: data,
    loadingDetail: loading,
    detailError: error,
    openCase,
    closeCase,
  }
}
