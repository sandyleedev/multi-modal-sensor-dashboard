import { Suspense } from 'react'
import ExplorerClient from './ExplorerClient'

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
      <ExplorerClient />
    </Suspense>
  )
}
