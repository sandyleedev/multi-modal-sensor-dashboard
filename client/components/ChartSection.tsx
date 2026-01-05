'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import annotationPlugin from 'chartjs-plugin-annotation'
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
  annotationPlugin,
)

export default function ChartSection({ data }: ChartSectionTypes) {
  const chartRef1 = useRef<ChartJS<'line', { x: string; y: number | null }[]>>(null)
  const chartRef2 = useRef<ChartJS<'line', { x: string; y: number | null }[]>>(null)
  const chartRef3 = useRef<ChartJS<'bar', { x: string; y: number | null }[]>>(null)
  const chartRefs = [chartRef1, chartRef2, chartRef3]

  const [diagonalPattern, setDiagonalPattern] = useState<CanvasPattern | string | undefined>(
    undefined,
  )

  useEffect(() => {
    // Create a diagonal pattern canvas for masked (filtered) data regions
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 10
    canvas.height = 10

    if (ctx) {
      // 1. Fill background with very light gray
      ctx.fillStyle = 'rgba(0, 0, 0, 0.01)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 2. Draw a diagonal line for the pattern
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, 10)
      ctx.lineTo(10, 0)
      ctx.stroke()

      // 3. Create a pattern object and store it in state
      const pattern = ctx.createPattern(canvas, 'repeat')
      if (pattern) setDiagonalPattern(pattern)
    }
  }, [])

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
   * Helper: Returns null if the value is null or undefined to break the chart line
   * otherwise, converts the value to a number.
   */
  const toValue = (val: any) => (val === null || val === undefined ? null : Number(val))

  // Tier 1 Data: Environmental metrics (Temperature & Humidity)
  const tempHumidData = {
    datasets: [
      {
        label: 'Temp (°C)',
        data: data.map((d) => ({
          x: d.result_time,
          y: toValue(d.temp),
        })),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
        spanGaps: false,
      },
      {
        label: 'Humid (%)',
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
    datasets: [
      {
        label: 'Brightness (lux)',
        data: data.map((d) => ({ x: d.result_time, y: toValue(d.bright) })),
        borderColor: 'rgb(255,166,0)',
        backgroundColor: 'rgba(255, 166, 0, 0.5)',
        yAxisID: 'y',
        // tension: 0.3,
        spanGaps: false,
      },
      {
        label: 'Sound (dB)',
        data: data.map((d) => ({ x: d.result_time, y: toValue(d.soundlevel) })),
        borderColor: 'rgb(10,175,46)',
        backgroundColor: 'rgba(10, 175, 46, 0.5)',
        yAxisID: 'y1',
        spanGaps: false,
      },
    ],
  }

  // Tier 3 Data: Presence detection (PIR Motion)
  const pirData = {
    datasets: [
      {
        label: 'PIR (Motion)',
        data: data.map((d) => ({ x: d.result_time, y: toValue(d.pir) })),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        barPercentage: 0.9,
        categoryPercentage: 0.9,
      },
    ],
  }

  const maskAnnotations = useMemo(() => {
    const annotations: any = {}
    let gapStart: string | null = null

    data.forEach((d, i) => {
      if (d.temp === null && gapStart === null) {
        gapStart = d.result_time
      } else if (d.temp !== null && gapStart !== null) {
        annotations[`gap-${i}`] = {
          type: 'box',
          xMin: gapStart,
          xMax: d.result_time,
          backgroundColor: diagonalPattern || 'rgba(200, 200, 200, 0.1)',
          borderWidth: 0,
        }
        gapStart = null
      }
    })

    if (gapStart !== null && data.length > 0) {
      annotations[`gap-last`] = {
        type: 'box',
        xMin: gapStart,
        xMax: data[data.length - 1].result_time,
        backgroundColor: diagonalPattern || 'rgba(200, 200, 200, 0.1)',
        borderWidth: 0,
      }
    }
    return annotations
  }, [data, diagonalPattern])

  const tempHumidOptions = useMemo(
    () => getTempHumidOptions(syncCharts, maskAnnotations),
    [maskAnnotations],
  )

  const brightSoundOptions = useMemo(
    () => getBrightSoundOptions(syncCharts, maskAnnotations),
    [maskAnnotations],
  )

  const pirOptions = useMemo(() => getPirOptions(syncCharts, maskAnnotations), [maskAnnotations])

  return (
    <div className="flex flex-col gap-6">
      {/* Chart 01: Temp & Humid Section */}
      <div className="h-[300px] rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-bold text-gray-500">1. Temperature & Humidity</h3>
        <Line
          ref={chartRef1}
          data={tempHumidData}
          onMouseLeave={clearSync}
          options={tempHumidOptions}
        />
      </div>

      {/* Chart 02: Brightness & Sound Section */}
      <div className="h-[280px] rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-xs font-bold text-gray-400 uppercase">2. Brightness & Sound</h3>
        <Line
          ref={chartRef2}
          data={brightSoundData}
          onMouseLeave={clearSync}
          options={brightSoundOptions}
        />
      </div>

      {/* Chart 03: PIR Motion Detection Section */}
      <div className="h-[180px] rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-xs font-bold text-gray-400 uppercase">3. PIR Motion Detection</h3>
        <Bar ref={chartRef3} data={pirData} onMouseLeave={clearSync} options={pirOptions} />
      </div>
    </div>
  )
}
