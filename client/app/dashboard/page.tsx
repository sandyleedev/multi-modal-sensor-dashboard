import { Metadata } from 'next'
import DashboardClient from '@/app/dashboard/DashboardClient'

export const metadata: Metadata = {
  title: 'Dashboard | Temperature-Based Interaction Explorer',
}

export default function DashboardPage() {
  return (
    <>
      <DashboardClient />
    </>
  )
}
