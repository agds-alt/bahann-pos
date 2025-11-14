/**
 * Validation Schemas Index
 * Central export point for all validation schemas
 *
 * Usage:
 * ```typescript
 * // Import specific schemas
 * import { CreateProductSchema, UpdateProductSchema } from '@/shared/schemas'
 *
 * // Import all product schemas
 * import * as ProductSchemas from '@/shared/schemas'
 * ```
 *
 * Benefits of this structure:
 * - Better code organization and maintainability
 * - Improved tree-shaking in production builds
 * - Easier to locate and update schemas
 * - Reusable schemas across routers and components
 * - Type-safe validation with TypeScript inference
 */

// ============================================================================
// Common Schemas
// ============================================================================
export * from './common.schemas'

// ============================================================================
// Feature-Specific Schemas
// ============================================================================
export * from './product.schemas'
export * from './transaction.schemas'

// ============================================================================
// Lazy Loading Pattern (For Future Heavy Schemas)
// ============================================================================
/**
 * For very large schema files that are rarely used, you can use dynamic imports:
 *
 * ```typescript
 * // Heavy schema file: analytics.schemas.ts
 * export const loadAnalyticsSchemas = () => import('./analytics.schemas')
 *
 * // Usage in router:
 * const { AdvancedAnalyticsSchema } = await import('@/shared/schemas/analytics.schemas')
 * ```
 *
 * This allows code splitting even for server-side validation schemas,
 * though the benefit is less pronounced than client-side splitting.
 */

// ============================================================================
// Re-export Pattern for Backward Compatibility
// ============================================================================
/**
 * If migrating from inline schemas to this structure, you can provide
 * backward-compatible exports:
 *
 * ```typescript
 * // Old usage (deprecated):
 * const createProductInput = z.object({ ... })
 *
 * // New usage:
 * import { CreateProductSchema } from '@/shared/schemas'
 *
 * // Backward compatibility export:
 * export { CreateProductSchema as createProductInput }
 * ```
 */
