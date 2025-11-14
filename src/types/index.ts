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

/**
 * Transaction Management Types
 */
export type TransactionStatus = 'pending' | 'completed' | 'voided' | 'refunded'
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'ewallet'

export interface Transaction {
  id: string
  transaction_id: string
  outlet_id: string
  cashier_id: string
  status: TransactionStatus

  // Financial details
  subtotal: number
  discount_amount: number
  tax_amount: number
  total_amount: number

  // Payment details
  payment_method: PaymentMethod
  amount_paid: number
  change_amount: number

  // Void tracking
  void_reason?: string
  voided_by?: string
  voided_at?: string

  // Refund tracking
  refund_reason?: string
  refunded_by?: string
  refunded_at?: string
  refund_amount?: number

  // Additional info
  notes?: string
  created_at: string
  updated_at: string

  // Relations (optional, loaded with joins)
  transaction_items?: TransactionItem[]
  outlet?: Outlet
  cashier?: User
}

export interface TransactionItem {
  id: string
  transaction_id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  line_total: number
  created_at: string
}

/**
 * Cash Session Types (for EOD)
 */
export type CashSessionStatus = 'open' | 'closed'

export interface CashSession {
  id: string
  outlet_id: string

  // Opening details
  opened_by: string
  opened_at: string
  opening_cash: number

  // Closing details
  closed_by?: string
  closed_at?: string
  closing_cash?: number

  // Calculated fields
  expected_cash?: number
  actual_cash?: number
  difference?: number

  // Summary
  total_sales?: number
  total_transactions?: number
  cash_sales?: number
  card_sales?: number
  transfer_sales?: number
  ewallet_sales?: number
  total_discount?: number

  notes?: string
  status: CashSessionStatus
  created_at: string
  updated_at: string
}

/**
 * Promotion Types
 */
export type PromotionType = 'fixed' | 'percentage' | 'buy_x_get_y'

export interface Promotion {
  id: string
  code: string
  name: string
  description?: string

  type: PromotionType

  // Discount values
  discount_amount?: number
  discount_percentage?: number

  // Conditions
  min_purchase?: number
  max_discount?: number
  applicable_products?: string[]
  applicable_categories?: string[]

  // Buy X Get Y
  buy_quantity?: number
  get_quantity?: number
  get_product_id?: string

  // Validity
  start_date?: string
  end_date?: string
  is_active: boolean

  // Usage limits
  max_uses?: number
  uses_count: number
  max_uses_per_customer?: number

  created_by: string
  created_at: string
  updated_at: string
}

/**
 * Stock Alert Types
 */
export type StockAlertType = 'low_stock' | 'out_of_stock' | 'reorder_suggested'

export interface StockAlert {
  id: string
  product_id: string
  outlet_id: string
  alert_type: StockAlertType

  current_stock: number
  reorder_point: number

  is_acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: string

  created_at: string

  // Relations (optional, loaded with joins)
  product?: Product
  outlet?: Outlet
}

/**
 * Extended Product with reorder fields
 */
export interface ProductWithReorder extends Product {
  reorder_point?: number
  reorder_quantity?: number
  lead_time_days?: number
}

/**
 * User Permissions
 */
export interface UserPermissions {
  canVoidTransactions?: boolean
  canGiveDiscount?: boolean
  maxDiscountPercent?: number
  canCloseDay?: boolean
  canManageUsers?: boolean
  canEditPrices?: boolean
  canManagePromotions?: boolean
  canViewReports?: boolean
  canManageInventory?: boolean
}

/**
 * Extended User with permissions
 */
export interface UserWithPermissions extends User {
  permissions?: UserPermissions
}
