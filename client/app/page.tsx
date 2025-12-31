'use client'

import { useState, useEffect } from 'react'
import ControlPanel from '@/components/ControlPanel'
import ChartSection from '@/components/ChartSection'
import { SensorData } from '@/types/sensor.types'

export default function ExplorerPage() {
  const [data, setData] = useState<SensorData[]>([])
  const [selectedNode, setSelectedNode] = useState(13)
  const [loading, setLoading] = useState(false)

  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const fetchData = async () => {
    if (!startTime || !endTime) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        nodeId: selectedNode.toString(),
        start: startTime,
        end: endTime,
      })

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sensors/explorer?${params.toString()}`,
      )
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedNode]) // Fetch data on node change

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <ControlPanel
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        onSearch={fetchData}
      />

      <section className="h-full flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Data Explorer</h1>
            <button
              onClick={fetchData}
              className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <ChartSection data={data} />
        </div>
      </section>
    </div>
  )
}
