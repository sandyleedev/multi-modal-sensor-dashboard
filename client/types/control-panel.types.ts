import { FilterCondition } from '@/types/filter.types'

/**
 * Props for the ControlPanel component
 */
export interface ControlPanelTypes {
  selectedNode: number
  setSelectedNode: (id: number) => void
  startTime: string
  setStartTime: (val: string) => void
  endTime: string
  setEndTime: (val: string) => void
  onSearch: () => void
  dbRange: { min: string; max: string }
  filters: FilterCondition[]
  setFilters: React.Dispatch<React.SetStateAction<FilterCondition[]>>
}
