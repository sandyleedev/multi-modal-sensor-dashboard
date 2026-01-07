'use client'

import React, { useMemo, useRef } from 'react'
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
import { useChartMasking } from '@/hooks/useChartMasking'
import { calculateMaskAnnotations } from '@/utils/chartUtils'
import ChartWrapper from '@/components/ChartWrapper'

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

  const diagonalPattern = useChartMasking()

  /**
   * Synchronizes crosshairs and tooltips across all charts based on mouse position
   * Fixed: Added defensive logic to prevent 'Cannot set properties of undefined (setting active)'
   * which occurred during data filtering or when data lengths mismatched between charts.
   */
  const syncCharts = (event: any) => {
    // 1. Identify the chart currently being hovered by the user.
    const activeChart = chartRefs.find((ref) => ref.current?.canvas === event.native.target)
    if (!activeChart || !activeChart.current) return

    // 2. Retrieve the data point index corresponding to the mouse position.
    const points = activeChart.current.getElementsAtEventForMode(
      event.native,
      'index',
      { intersect: false },
      true,
    )

    // [Defensive] If the mouse is outside the data area or no points are found, clear synchronization.
    if (!points || points.length === 0) {
      clearSync()
      return
    }

    const index = points[0].index

    // 3. Iterate through all charts to apply the synchronized hover state.
    chartRefs.forEach((ref) => {
      const chart = ref.current
      // [Defensive] Skip if the chart object or datasets are not yet initialized.
      if (!chart || !chart.data || !chart.data.datasets) return

      try {
        /**
         * [Core Fix]
         * Check if the 'index' from the active chart exists in the target chart's data range.
         * If a chart has fewer data points (e.g., due to filtering lag), accessing a non-existent
         * index causes Chart.js to throw a TypeError when trying to set the 'active' state.
         */
        const elements = chart.data.datasets
          .map((dataset, dIndex) => {
            if (dataset.data && dataset.data.length > index) {
              return { datasetIndex: dIndex, index: index }
            }
            return null
          })
          // Filter out null values to ensure only valid element objects are passed.
          .filter((el): el is { datasetIndex: number; index: number } => el !== null)

        // 4. Update the chart state only if valid data points were found.
        if (elements.length > 0) {
          // Activate hover effects (e.g., highlighting points).
          chart.setActiveElements(elements)

          // Force-activate tooltips even if the mouse is not directly over this specific chart.
          if (chart.tooltip) {
            chart.tooltip.setActiveElements(elements, { x: 0, y: 0 })
          }
          /**
           * [Stability] Use 'none' mode to update the chart immediately without animation.
           * This reduces the risk of race conditions during rapid data re-rendering.
           */
          chart.update('none')
        }
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

  const maskAnnotations = useMemo(
    () => calculateMaskAnnotations(data, diagonalPattern),
    [data, diagonalPattern],
  )

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
      <ChartWrapper title="1. Temperature & Humidity" height="300px">
        <Line
          ref={chartRef1}
          data={tempHumidData}
          onMouseLeave={clearSync}
          options={tempHumidOptions}
        />
      </ChartWrapper>

      {/* Chart 02: Brightness & Sound Section */}
      <ChartWrapper title="2. Brightness & Sound" height="280px">
        <Line
          ref={chartRef2}
          data={brightSoundData}
          onMouseLeave={clearSync}
          options={brightSoundOptions}
        />
      </ChartWrapper>

      {/* Chart 03: PIR Motion Detection Section */}
      <ChartWrapper title="3. PIR Motion Detection" height="180px">
        <Bar ref={chartRef3} data={pirData} onMouseLeave={clearSync} options={pirOptions} />
      </ChartWrapper>
    </div>
  )
}
