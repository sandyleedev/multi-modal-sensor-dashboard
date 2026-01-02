import { ChartOptions } from 'chart.js'

/**
 * Base configuration for all charts to ensure consistent look and feel
 */
const getBaseOptions = (onHoverHandler: any): ChartOptions<any> => ({
  responsive: true,
  maintainAspectRatio: false,
  spanGaps: false,
  onHover: onHoverHandler,
  plugins: {
    legend: { position: 'top' as const },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'hour',
      },
      grid: { display: true, color: 'rgba(0, 0, 0, 0.05)', drawOnChartArea: true },
    },
  },
  elements: {
    point: {
      radius: 1.5,
      hoverRadius: 4,
    },
    line: {
      borderWidth: 1.5,
      tension: 0.3,
    },
  },
})

/**
 * Options for Temperature & Humidity (Dual Y-Axis)
 */
export const getTempHumidOptions = (onHoverHandler: any): ChartOptions<'line'> => {
  const base = getBaseOptions(onHoverHandler)
  return {
    ...base,
    scales: {
      ...base.scales,
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          color: 'rgb(255, 99, 132)',
          font: { weight: 'bold' },
        },
        // title: { display: true, text: '°C' },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        ticks: {
          color: 'rgb(53, 162, 235)',
          font: { weight: 'bold' },
        },
        grid: {
          drawOnChartArea: false,
        },
        // title: { display: true, text: '%' },
      },
    },
  }
}

/**
 * Options for Brightness & Sound (Dual Y-Axis with Titles)
 */
export const getBrightSoundOptions = (onHoverHandler: any): ChartOptions<'line'> => {
  const base = getBaseOptions(onHoverHandler)
  return {
    ...base,
    scales: {
      ...base.scales,
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          color: 'rgb(255,166,0)',
          font: { weight: 'bold' },
        },
        // title: { display: true, text: 'Lux' },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: {
          color: 'rgb(10, 175, 46)',
          font: { weight: 'bold' },
        },
        // title: { display: true, text: 'dB' },
      },
    },
  }
}

/**
 * Options for PIR Motion (Binary Y-Axis: ON/OFF)
 */
export const getPirOptions = (onHoverHandler: any): ChartOptions<'bar'> => {
  const base = getBaseOptions(onHoverHandler)
  return {
    ...base,
    scales: {
      ...base.scales,
      y: {
        min: 0,
        max: 1,
        ticks: {
          stepSize: 1,
          color: 'rgb(75, 192, 192)',
          font: { weight: 'bold' },
          callback: (value) => (value === 1 ? 'ON' : 'OFF'),
        },
      },
    },
  }
}
