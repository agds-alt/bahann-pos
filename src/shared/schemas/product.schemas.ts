/**
 * Product Validation Schemas
 * Split by feature for better code organization and potential lazy loading
 *
 * Benefits:
 * - Reusable across multiple routers/components
 * - Single source of truth for validation
 * - Better tree-shaking in production builds
 * - Easier to maintain and test
 */

import { z } from 'zod'

// ============================================================================
// Base Product Schemas
// ============================================================================

export const ProductIdSchema = z.object({
  id: z.string().uuid('Invalid product ID format'),
})

export const ProductSkuSchema = z
  .string()
  .min(1, 'SKU is required')
  .max(50, 'SKU must be 50 characters or less')
  .regex(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens')

export const ProductNameSchema = z
  .string()
  .min(1, 'Product name is required')
  .max(200, 'Product name must be 200 characters or less')

export const ProductCategorySchema = z
  .string()
  .max(100, 'Category name must be 100 characters or less')
  .optional()

export const ProductPriceSchema = z
  .number()
  .positive('Price must be greater than zero')
  .max(1000000000, 'Price exceeds maximum allowed value')

// ============================================================================
// Product Query Schemas
// ============================================================================

export const ProductListQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z.number().min(1).max(100, 'Limit cannot exceed 100').default(50),
}).optional()

export const ProductByIdQuerySchema = ProductIdSchema

// ============================================================================
// Product Mutation Schemas
// ============================================================================

export const CreateProductSchema = z.object({
  sku: ProductSkuSchema,
  name: ProductNameSchema,
  category: ProductCategorySchema,
  price: ProductPriceSchema.optional(),
})

export const UpdateProductSchema = z.object({
  id: z.string().uuid('Invalid product ID format'),
  sku: ProductSkuSchema,
  name: ProductNameSchema,
  category: ProductCategorySchema,
  price: ProductPriceSchema.optional(),
})

export const DeleteProductSchema = ProductIdSchema

// ============================================================================
// Product Filter Schemas
// ============================================================================

export const ProductFilterSchema = z.object({
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  categories: z.array(z.string()).optional(),
  inStock: z.boolean().optional(),
})

// ============================================================================
// Bulk Operations Schemas
// ============================================================================

export const BulkCreateProductsSchema = z.object({
  products: z.array(CreateProductSchema).min(1).max(100),
})

export const BulkUpdateProductsSchema = z.object({
  products: z.array(UpdateProductSchema).min(1).max(100),
})

export const BulkDeleteProductsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
})

// ============================================================================
// Type Exports
// ============================================================================

export type ProductListQuery = z.infer<typeof ProductListQuerySchema>
export type ProductByIdQuery = z.infer<typeof ProductByIdQuerySchema>
export type CreateProduct = z.infer<typeof CreateProductSchema>
export type UpdateProduct = z.infer<typeof UpdateProductSchema>
export type DeleteProduct = z.infer<typeof DeleteProductSchema>
export type ProductFilter = z.infer<typeof ProductFilterSchema>
export type BulkCreateProducts = z.infer<typeof BulkCreateProductsSchema>
export type BulkUpdateProducts = z.infer<typeof BulkUpdateProductsSchema>
export type BulkDeleteProducts = z.infer<typeof BulkDeleteProductsSchema>
