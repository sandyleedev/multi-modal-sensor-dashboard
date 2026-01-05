import { SensorData } from '@/types/sensor.types'

/**
 * Calculates box annotations for regions where data is null (filtered).
 * Covers both gaps between data points and trailing gaps at the end of the array.
 */
export const calculateMaskAnnotations = (
  data: SensorData[],
  pattern: CanvasPattern | string | undefined,
) => {
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
        backgroundColor: pattern || 'rgba(200, 200, 200, 0.1)',
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
      backgroundColor: pattern || 'rgba(200, 200, 200, 0.1)',
      borderWidth: 0,
    }
  }
  return annotations
}
