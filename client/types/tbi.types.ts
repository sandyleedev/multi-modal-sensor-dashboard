export type CategoryItem = {
  id: number
  name: string
  slug: string | null
  sortOrder: number
}

export type CategoriesResponse = Record<string, CategoryItem[]>

export type CaseItem = {
  id: number
  title: string
  summary: string
  detail?: string | null
  year?: number | null
  link?: string | null
  created_at?: string
  updated_at?: string
  tags?: {
    scenario: string[]
    technology: string[]
  }
}

export type CasesResponse = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  items: CaseItem[]
}
