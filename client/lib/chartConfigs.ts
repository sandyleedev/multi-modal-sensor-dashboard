import { ChartOptions } from 'chart.js'

const Y_AXIS_WIDTH = 45

/**
 * Base configuration for all charts to ensure consistent look and feel
 */
const getBaseOptions = (
  onHoverHandler: any,
  annotations: any = {},
  startTime?: string,
  endTime?: string,
): ChartOptions<any> => {
  // Logic to calculate time duration/difference
  const getTimeUnit = () => {
    if (!startTime || !endTime) return 'hour'
    const diffInDays =
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60 * 24)
    // Use 'day' unit if the range exceeds 4 days for better readability
    if (diffInDays > 4) return 'day'
    // Maintain 'hour' unit for shorter ranges (Format will be adjusted accordingly)
    if (diffInDays > 1) return 'hour'
    return 'hour'
  }

  const unit = getTimeUnit()

  return {
    responsive: true,
    maintainAspectRatio: false,
    spanGaps: false,
    onHover: onHoverHandler,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: (context: any) => {
            const date = new Date(context[0].parsed.x)
            return date.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })
          },
        },
      },
      annotation: {
        annotations: annotations,
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: unit as any,
          displayFormats: {
            hour: 'MMM d, ha', // for normal time range - with hour (ex: Nov 10, 1PM)
            day: 'MMM d', // for longer time range - only date (ex: Nov 10)
          },
          tooltipFormat: 'MMM d, yyyy h:mm',
        },
        grid: { display: true, color: 'rgba(0, 0, 0, 0.05)', drawOnChartArea: true },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
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
  }
}

/**
 * Options for Temperature & Humidity (Dual Y-Axis)
 */
export const getTempHumidOptions = (
  onHoverHandler: any,
  annotations: any,
  startTime: string,
  endTime: string,
): ChartOptions<'line'> => {
  const base = getBaseOptions(onHoverHandler, annotations, startTime, endTime)
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
        afterFit: (axis: any) => {
          axis.width = Y_AXIS_WIDTH
        },
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
        afterFit: (axis: any) => {
          axis.width = Y_AXIS_WIDTH
        },
      },
    },
  }
}

/**
 * Options for Brightness & Sound (Dual Y-Axis with Titles)
 */
export const getBrightSoundOptions = (
  onHoverHandler: any,
  annotations: any,
  startTime: string,
  endTime: string,
): ChartOptions<'line'> => {
  const base = getBaseOptions(onHoverHandler, annotations, startTime, endTime)
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
        afterFit: (axis: any) => {
          axis.width = Y_AXIS_WIDTH
        },
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
        afterFit: (axis: any) => {
          axis.width = Y_AXIS_WIDTH
        },
      },
    },
  }
}

/**
 * Options for PIR Motion (Binary Y-Axis: ON/OFF)
 */
export const getPirOptions = (
  onHoverHandler: any,
  annotations: any,
  startTime: string,
  endTime: string,
): ChartOptions<'bar'> => {
  const base = getBaseOptions(onHoverHandler, annotations, startTime, endTime)
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
        afterFit: (axis: any) => {
          axis.width = Y_AXIS_WIDTH
        },
      },
      // Add a virtual right Y-axis for layout alignment
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: { display: false },
        border: { display: false },
        afterFit: (axis: any) => {
          axis.width = Y_AXIS_WIDTH
        },
      },
    },
  }
}
