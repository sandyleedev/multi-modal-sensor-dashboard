'use client'

import { useState, useEffect } from 'react'
import ControlPanel from '@/components/ControlPanel'
import ChartSection from '@/components/ChartSection'
import { SensorData } from '@/types/sensor.types'

export default function ExplorerPage() {
  const [data, setData] = useState<SensorData[]>([])
  const [selectedNode, setSelectedNode] = useState(1)
  const [loading, setLoading] = useState(false)

  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [dbRange, setDbRange] = useState({ min: '', max: '' })

  const fetchDbRange = async () => {
    try {
      // 1. Fetch the overall time boundaries (min/max) from the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sensors/range`)
      const data = await response.json()

      /**
       * Helper: Formats a Date object or string into 'YYYY-MM-DDTHH:mm'
       * This format is required for 'datetime-local' input elements.
       */
      const formatDate = (dateInput: string | Date) => {
        // Ensure input is converted to a Date object
        const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput

        // Adjust to local timezone offset and return formatted string (up to minutes)
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      }

      // 2. Set the global database range constraints
      const min = formatDate(data.min_time)
      const max = formatDate(data.max_time)
      setDbRange({ min, max })

      // 3. Initialize default filter values (Default to the most recent 24 hours)
      const maxDate = new Date(data.max_time)
      const minDate = new Date(data.min_time)

      // Calculate 24 hours prior to the latest data point
      const twentyFourHoursAgo = new Date(maxDate.getTime() - 24 * 60 * 60 * 1000)

      // Safety check: Ensure the start time does not precede the actual database min_time
      const finalStart = twentyFourHoursAgo < minDate ? minDate : twentyFourHoursAgo

      // 4. Update state to trigger initial data fetch and UI updates
      setStartTime(formatDate(finalStart))
      setEndTime(formatDate(maxDate))
    } catch (error) {
      console.error('Failed to fetch DB range:', error)
    }
  }

  useEffect(() => {
    fetchDbRange()
  }, [])

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
    if (startTime && endTime) {
      fetchData()
    }
  }, [selectedNode, startTime, endTime])

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
        dbRange={{ min: dbRange.min, max: dbRange.max }}
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
