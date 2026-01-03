'use client'

import React, { useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { Line, Bar } from 'react-chartjs-2'
import { getTempHumidOptions, getBrightSoundOptions, getPirOptions } from '@/lib/chartConfigs'
import { ChartSectionTypes } from '@/types/chart-section.types'

// Register Chart.js components required for rendering different chart types
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
)

export default function ChartSection({ data }: ChartSectionTypes) {
  const chartRef1 = useRef<ChartJS<'line', { x: string; y: number | null }[]>>(null)
  const chartRef2 = useRef<ChartJS<'line', { x: string; y: number | null }[]>>(null)
  const chartRef3 = useRef<ChartJS<'bar', { x: string; y: number | null }[]>>(null)
  const chartRefs = [chartRef1, chartRef2, chartRef3]

  /**
   * Synchronizes crosshairs and tooltips across all charts based on mouse position
   * Triggers during the 'onHover' event of any single chart
   */
  const syncCharts = (event: any) => {
    const activeChart = chartRefs.find((ref) => ref.current?.canvas === event.native.target)
    if (!activeChart || !activeChart.current) return

    const points = activeChart.current.getElementsAtEventForMode(
      event.native,
      'index',
      { intersect: false },
      true,
    )

    if (!points || points.length === 0) {
      clearSync()
      return
    }

    const index = points[0].index

    chartRefs.forEach((ref) => {
      const chart = ref.current
      if (!chart) return

      try {
        const elements = chart.data.datasets.map((_, dIndex) => ({
          datasetIndex: dIndex,
          index: index,
        }))

        if (elements !== undefined) {
          chart.setActiveElements(elements)
        }
        if (chart.tooltip) {
          chart.tooltip.setActiveElements(elements, { x: 0, y: 0 })
        }
        chart.update('none')
      } catch (error) {
        console.warn('Sync failed for index:', index)
      }
    })
  }

  /**
   * Clears all active tooltips and hover states across the chart group
   * Triggered when the mouse leaves each chart section area
   */
  const clearSync = () => {
    chartRefs.forEach((ref) => {
      const chart = ref.current
      if (!chart) return

      chart.setActiveElements([])

      if (chart.tooltip) {
        chart.tooltip.setActiveElements([], { x: 0, y: 0 })
      }

      chart.update('none')
    })
  }

  /**
   * Helper: null이나 undefined인 경우 null을 반환하여 차트 선을 끊고,
   * 값이 있는 경우에만 숫자로 변환합니다.
   */
  const toValue = (val: any) => (val === null || val === undefined ? null : Number(val))

  // Tier 1 Data: Environmental metrics (Temperature & Humidity)
  const tempHumidData = {
    // labels: data.map((d) => new Date(d.result_time).toLocaleTimeString()),
    datasets: [
      {
        label: 'Temp (°C)',
        data: data.map((d) => ({
          x: d.result_time,
          y: toValue(d.temp),
        })),
        // data: data.map((d) => d.temp),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
        spanGaps: false,
      },
      {
        label: 'Humid (%)',
        // data: data.map((d) => d.humid),
        data: data.map((d) => ({
          x: d.result_time,
          y: toValue(d.humid),
        })),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y1',
        spanGaps: false,
      },
    ],
  }

  // Tier 2 Data: Ambient metrics (Brightness & Sound)
  const brightSoundData = {
    // labels: data.map((d) => new Date(d.result_time).toLocaleTimeString()),
    datasets: [
      {
        label: 'Brightness (lux)',
        // data: data.map((d) => d.bright),
        data: data.map((d) => ({ x: d.result_time, y: toValue(d.bright) })),
        borderColor: 'rgb(255,166,0)',
        backgroundColor: 'rgba(255, 166, 0, 0.5)',
        yAxisID: 'y',
        // tension: 0.3,
        spanGaps: false,
      },
      {
        label: 'Sound (dB)',
        // data: data.map((d) => d.soundlevel),
        data: data.map((d) => ({ x: d.result_time, y: toValue(d.soundlevel) })),
        borderColor: 'rgb(10,175,46)',
        backgroundColor: 'rgba(10, 175, 46, 0.5)',
        yAxisID: 'y1',
        // tension: 0.3,
        spanGaps: false,
      },
    ],
  }

  // Tier 3 Data: Presence detection (PIR Motion)
  const pirData = {
    // labels: data.map((d) => new Date(d.result_time).toLocaleTimeString()),
    datasets: [
      {
        label: 'PIR (Motion)',
        // data: data.map((d) => d.pir),
        data: data.map((d) => ({ x: d.result_time, y: toValue(d.pir) })),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        barPercentage: 0.9,
        categoryPercentage: 0.9,
      },
    ],
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Chart 01: Temp & Humid Section */}
      <div className="h-[300px] rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-bold text-gray-500">1. Temperature & Humidity</h3>
        <Line
          ref={chartRef1}
          data={tempHumidData}
          onMouseLeave={clearSync}
          options={getTempHumidOptions(syncCharts)}
        />
      </div>

      {/* Chart 02: Brightness & Sound Section */}
      <div className="h-[280px] rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-xs font-bold text-gray-400 uppercase">2. Brightness & Sound</h3>
        <Line
          ref={chartRef2}
          data={brightSoundData}
          onMouseLeave={clearSync}
          options={getBrightSoundOptions(syncCharts)}
        />
      </div>

      {/* Chart 03: PIR Motion Detection Section */}
      <div className="h-[180px] rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-xs font-bold text-gray-400 uppercase">3. PIR Motion Detection</h3>
        <Bar
          ref={chartRef3}
          data={pirData}
          onMouseLeave={clearSync}
          options={getPirOptions(syncCharts)}
        />
      </div>
    </div>
  )
}
