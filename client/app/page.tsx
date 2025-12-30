'use client'

import { useEffect, useState } from 'react'

// Define the data structure
interface SensorData {
  id: number
  nodeid: number
  temp: number
  humid: number
  voltage: number
  result_time: string
}

export default function Home() {
  const [data, setData] = useState<SensorData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sensors`)
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch sensor data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sensor Dashboard</h1>
          <p className="text-gray-600">Real-time data from 600,000+ records</p>
        </header>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Summary Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left">
                <thead className="border-b border-gray-200 bg-gray-50 text-sm text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Node ID</th>
                    <th className="px-6 py-4 font-semibold">Temp (°C)</th>
                    <th className="px-6 py-4 font-semibold">Humidity (%)</th>
                    <th className="px-6 py-4 font-semibold">Voltage</th>
                    <th className="px-6 py-4 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-blue-50">
                      <td className="px-6 py-4 font-medium text-blue-600">#{item.nodeid}</td>
                      <td className="px-6 py-4">{item.temp}</td>
                      <td className="px-6 py-4">{item.humid}</td>
                      <td className="px-6 py-4 text-gray-500">{item.voltage}V</td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {new Date(item.result_time).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
