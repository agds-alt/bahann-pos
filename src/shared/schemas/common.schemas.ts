/**
 * Common Validation Schemas
 * Reusable validation schemas used across multiple features
 *
 * Benefits:
 * - DRY (Don't Repeat Yourself) principle
 * - Consistent validation across the application
 * - Single place to update common validation rules
 */

import { z } from 'zod'

// ============================================================================
// ID Schemas
// ============================================================================

export const UUIDSchema = z.string().uuid('Invalid UUID format')

export const OptionalUUIDSchema = z.string().uuid('Invalid UUID format').optional()

// ============================================================================
// Pagination Schemas
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(50),
})

export const PaginationWithSearchSchema = PaginationSchema.extend({
  search: z.string().max(200, 'Search query too long').optional(),
})

// ============================================================================
// Date/Time Schemas
// ============================================================================

export const DateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')

export const DateTimeStringSchema = z
  .string()
  .datetime('Invalid datetime format')

export const DateRangeSchema = z.object({
  startDate: DateTimeStringSchema,
  endDate: DateTimeStringSchema,
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  { message: 'Start date must be before or equal to end date' }
)

// ============================================================================
// Currency/Money Schemas
// ============================================================================

export const CurrencyAmountSchema = z
  .number()
  .nonnegative('Amount cannot be negative')
  .finite('Amount must be a valid number')
  .max(1000000000, 'Amount exceeds maximum allowed value')

export const PositiveCurrencyAmountSchema = z
  .number()
  .positive('Amount must be greater than zero')
  .finite('Amount must be a valid number')
  .max(1000000000, 'Amount exceeds maximum allowed value')

export const DiscountAmountSchema = z
  .number()
  .nonnegative('Discount cannot be negative')
  .max(100, 'Discount percentage cannot exceed 100%')

// ============================================================================
// Text Schemas
// ============================================================================

export const ShortTextSchema = z
  .string()
  .min(1, 'Field is required')
  .max(100, 'Text must be 100 characters or less')

export const MediumTextSchema = z
  .string()
  .min(1, 'Field is required')
  .max(500, 'Text must be 500 characters or less')

export const LongTextSchema = z
  .string()
  .max(5000, 'Text must be 5000 characters or less')

export const OptionalNotesSchema = z
  .string()
  .max(1000, 'Notes must be 1000 characters or less')
  .optional()

// ============================================================================
// Email/Contact Schemas
// ============================================================================

export const EmailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email must be 255 characters or less')

export const PhoneNumberSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional()

// ============================================================================
// Address Schemas
// ============================================================================

export const AddressSchema = z.object({
  street: z.string().max(200, 'Street address too long'),
  city: z.string().max(100, 'City name too long'),
  state: z.string().max(100, 'State/province name too long').optional(),
  postalCode: z.string().max(20, 'Postal code too long').optional(),
  country: z.string().max(100, 'Country name too long'),
})

// ============================================================================
// Sorting/Ordering Schemas
// ============================================================================

export const SortOrderSchema = z.enum(['asc', 'desc']).default('asc')

export const SortableQuerySchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: SortOrderSchema,
})

// ============================================================================
// Status Schemas
// ============================================================================

export const ActiveStatusSchema = z.enum(['active', 'inactive'])

export const EnabledStatusSchema = z.boolean().default(true)

// ============================================================================
// Quantity/Stock Schemas
// ============================================================================

export const QuantitySchema = z
  .number()
  .int('Quantity must be a whole number')
  .nonnegative('Quantity cannot be negative')
  .max(1000000, 'Quantity exceeds maximum allowed value')

export const PositiveQuantitySchema = z
  .number()
  .int('Quantity must be a whole number')
  .positive('Quantity must be greater than zero')
  .max(1000000, 'Quantity exceeds maximum allowed value')

// ============================================================================
// Type Exports
// ============================================================================

export type PaginationQuery = z.infer<typeof PaginationSchema>
export type PaginationWithSearch = z.infer<typeof PaginationWithSearchSchema>
export type DateRange = z.infer<typeof DateRangeSchema>
export type Address = z.infer<typeof AddressSchema>
export type SortableQuery = z.infer<typeof SortableQuerySchema>
export type SortOrder = z.infer<typeof SortOrderSchema>
export type ActiveStatus = z.infer<typeof ActiveStatusSchema>
