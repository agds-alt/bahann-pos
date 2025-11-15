/**
 * Transaction Validation Schemas
 * Split by feature for better code organization and maintainability
 *
 * This demonstrates splitting complex nested schemas into reusable components
 */

import { z } from 'zod'

// ============================================================================
// Base Transaction Schemas
// ============================================================================

export const TransactionIdSchema = z.object({
  id: z.string().uuid('Invalid transaction ID format'),
})

export const PaymentMethodSchema = z.enum(['cash', 'card', 'transfer', 'ewallet'], {
  message: 'Invalid payment method',
})

export const TransactionStatusSchema = z.enum(
  ['pending', 'completed', 'voided', 'refunded'],
  { message: 'Invalid transaction status' }
)

// ============================================================================
// Transaction Item Schemas
// ============================================================================

export const TransactionItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  productName: z.string().min(1, 'Product name is required'),
  productSku: z.string().min(1, 'Product SKU is required'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  unitPrice: z.number().nonnegative('Unit price cannot be negative'),
})

export const TransactionItemsSchema = z
  .array(TransactionItemSchema)
  .min(1, 'At least one item is required')
  .max(100, 'Cannot process more than 100 items per transaction')

// ============================================================================
// Transaction Creation Schemas
// ============================================================================

export const CreateTransactionSchema = z.object({
  outletId: z.string().uuid('Invalid outlet ID'),
  items: TransactionItemsSchema,
  paymentMethod: PaymentMethodSchema,
  amountPaid: z.number().positive('Amount paid must be greater than zero'),
  discountAmount: z.number().nonnegative('Discount cannot be negative').default(0),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
})

// ============================================================================
// Transaction Query Schemas
// ============================================================================

export const GetTransactionByIdSchema = TransactionIdSchema

export const GetTransactionListSchema = z.object({
  outletId: z.string().uuid().optional(),
  status: TransactionStatusSchema.optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
}).optional()

// ============================================================================
// Transaction Mutation Schemas
// ============================================================================

export const VoidTransactionSchema = z.object({
  id: z.string().uuid('Invalid transaction ID'),
  reason: z.string().min(1, 'Void reason is required').max(500),
})

export const RefundTransactionSchema = z.object({
  id: z.string().uuid('Invalid transaction ID'),
  reason: z.string().min(1, 'Refund reason is required').max(500),
  refundAmount: z.number().positive('Refund amount must be greater than zero'),
  refundItems: z.array(
    z.object({
      transactionItemId: z.string().uuid(),
      quantity: z.number().positive(),
    })
  ).optional(),
})

// ============================================================================
// Transaction Analytics Schemas
// ============================================================================

export const TransactionAnalyticsQuerySchema = z.object({
  outletId: z.string().uuid().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  groupBy: z.enum(['day', 'week', 'month', 'hour']).default('day'),
})

export const TransactionRevenueQuerySchema = z.object({
  outletId: z.string().uuid().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  includeVoided: z.boolean().default(false),
})

// ============================================================================
// Transaction Validation Helpers
// ============================================================================

/**
 * Validates that payment amount is sufficient for total
 */
export const validatePaymentAmount = (
  amountPaid: number,
  subtotal: number,
  discountAmount: number,
  taxAmount: number = 0
) => {
  const total = subtotal - discountAmount + taxAmount
  const change = amountPaid - total

  if (change < 0) {
    throw new Error('Insufficient payment amount')
  }

  return {
    subtotal,
    discountAmount,
    taxAmount,
    total,
    amountPaid,
    change,
  }
}

// ============================================================================
// Type Exports
// ============================================================================

export type TransactionItem = z.infer<typeof TransactionItemSchema>
export type CreateTransaction = z.infer<typeof CreateTransactionSchema>
export type GetTransactionById = z.infer<typeof GetTransactionByIdSchema>
export type GetTransactionList = z.infer<typeof GetTransactionListSchema>
export type VoidTransaction = z.infer<typeof VoidTransactionSchema>
export type RefundTransaction = z.infer<typeof RefundTransactionSchema>
export type TransactionAnalyticsQuery = z.infer<typeof TransactionAnalyticsQuerySchema>
export type TransactionRevenueQuery = z.infer<typeof TransactionRevenueQuerySchema>
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>
