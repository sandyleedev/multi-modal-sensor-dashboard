export type FilterColumn = 'temp' | 'humid' | 'bright' | 'soundlevel' | 'pir'
export type FilterOperator = '>' | '<' | '>=' | '<=' | '='

export interface FilterCondition {
  column: FilterColumn
  operator: FilterOperator
  value: number
}
