/**
 * Shared TypeScript types and interfaces
 * Replaces all 'any' types for better type safety
 */

/**
 * Database entity types (from Supabase)
 */
export interface Product {
  id: string
  sku: string
  name: string
  category: string | null
  price: number | null
  created_at?: string
  updated_at?: string
}

export interface Outlet {
  id: string
  name: string
  address: string | null
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  email: string
  name: string
  outlet_id: string | null
  role: string | null
  created_at?: string
}

export interface DailySale {
  id: string
  product_id: string
  outlet_id: string
  sale_date: string
  quantity_sold: number
  unit_price: number
  revenue: number
  created_at?: string
}

export interface DailyStock {
  id: string
  product_id: string
  outlet_id: string
  stock_date: string
  stock_awal: number
  stock_in: number
  stock_out: number
  stock_akhir: number
  created_at?: string
}

/**
 * PWA BeforeInstallPromptEvent type
 * For better type safety in PWA installation
 */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

/**
 * Error types for better error handling
 */
export interface AppError {
  message: string
  code?: string
  statusCode?: number
  details?: unknown
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  error: {
    message: string
    code?: string
    details?: unknown
  }
}

/**
 * Form event types for React
 */
export type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>

/**
 * Pagination types
 */
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationResponse {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Chart/Recharts label props
 */
export interface ChartLabelProps {
  x?: number
  y?: number
  width?: number
  height?: number
  value?: number | string
  index?: number
}
