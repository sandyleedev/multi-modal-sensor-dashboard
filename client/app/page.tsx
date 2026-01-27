import { Suspense } from 'react'
import type { Metadata } from 'next'
import ExplorerClient from './ExplorerClient'

export const metadata: Metadata = {
  title: 'Temperature-Based Interaction Explorer',
  description: 'Search and filter temperature-based interaction cases by scenario and technology.',
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
      <ExplorerClient />
    </Suspense>
  )
}
