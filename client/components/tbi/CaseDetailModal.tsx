'use client'

import { useEffect } from 'react'
import type { CaseItem } from '@/types/tbi.types'

type Props = {
  open: boolean
  loading: boolean
  error: string | null
  caseItem: CaseItem | null
  onClose: () => void
}

export function CaseDetailModal({ open, loading, error, caseItem, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const title = caseItem?.title ?? ''
  const year = caseItem?.year ?? '—'
  const summary = caseItem?.summary ?? ''
  const detail = caseItem?.detail ?? null
  const link = caseItem?.link ?? null

  const tagsScenario = caseItem?.tags?.scenario ?? []
  const tagsTech = caseItem?.tags?.technology ?? []

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Case detail"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: 'min(900px, 100%)',
          maxHeight: 'min(80vh, 760px)',
          overflow: 'auto',
          borderRadius: 16,
          border: '1px solid #eee',
          background: '#fff',
          boxShadow: '0 18px 60px rgba(0,0,0,0.22)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 16,
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.25 }}>{title}</div>
            <div style={{ marginTop: 6, color: '#666', fontSize: 13 }}>{year}</div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              border: '1px solid #ddd',
              background: '#fff',
              borderRadius: 10,
              padding: '8px 10px',
              cursor: 'pointer',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 16 }}>
          {/* Error */}
          {error ? (
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
              {error}
            </div>
          ) : null}

          {/* Summary */}
          {summary ? (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Summary</div>
              <div style={{ color: '#444', fontSize: 14, lineHeight: 1.6 }}>{summary}</div>
            </div>
          ) : null}

          {/* Tags */}
          {(tagsScenario.length > 0 || tagsTech.length > 0) && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tagsScenario.map((t) => (
                  <span
                    key={`modal-s-${caseItem?.id ?? 'x'}-${t}`}
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
                {tagsTech.map((t) => (
                  <span
                    key={`modal-t-${caseItem?.id ?? 'x'}-${t}`}
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
          )}

          {/* Details */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Details</div>

            {loading ? (
              <div style={{ color: '#666', fontSize: 14 }}>Loading details...</div>
            ) : detail ? (
              <div style={{ color: '#333', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {detail}
              </div>
            ) : (
              <div style={{ color: '#777', fontSize: 14 }}>No detailed description provided.</div>
            )}
          </div>

          {/* Link */}
          {link ? (
            <div style={{ marginTop: 16 }}>
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#111',
                  textDecoration: 'underline',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Open external link
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
