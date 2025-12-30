'use client'

import { useEffect, useState } from 'react'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sensors`)
        const result = await response.json()
        setData(result.reverse())
      } catch (error) {
        console.error('Failed to fetch sensor data:', error)
      }
    }
    fetchData()
  }, [])

  const chartData = {
    labels: data.map((d) => new Date(d.result_time).toLocaleTimeString()),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: data.map((d) => d.temp),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Humidity (%)',
        data: data.map((d) => d.humid),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Real-time Sensor Data' },
    },
    scales: {
      y: { beginAtZero: false },
    },
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold">Sensor Dashboard (Chart.js)</h1>
        <div className="h-[400px]">
          <Line data={chartData} options={options} />
        </div>
      </div>
    </main>
  )
}
