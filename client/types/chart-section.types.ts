import { SensorData } from './sensor.types'

/**
 * Props for the ChartSection component
 */
export interface ChartSectionTypes {
  data: SensorData[]
  startTime: string
  endTime: string
}
