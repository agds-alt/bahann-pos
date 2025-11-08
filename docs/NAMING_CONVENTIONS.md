# Naming Conventions & Code Style Guide

## Overview

This document establishes the naming conventions and code style standards for the AGDS Corp POS project. All code-level elements (variables, functions, comments, error messages) must follow **English-only** naming conventions.

**Important**: This applies to CODE-LEVEL only. UI/UX text should use the i18n system for multi-language support.

## Language Standards

### ✅ English-Only (CODE)

All code elements must be in English:

- **Variable names**: `initialStock`, `finalStock`, `stockIn`, `stockOut`
- **Function names**: `calculateTotal()`, `validateStock()`, `recordDailyStock()`
- **Type/Interface names**: `DailyStock`, `Product`, `User`
- **Comments**: All inline comments and JSDoc
- **Error messages**: Exception messages (can be translated in UI layer)
- **Constants**: `MAX_RETRY_ATTEMPTS`, `DEFAULT_PAGE_SIZE`

**Examples**:

```typescript
// ✅ CORRECT - English naming
export type DailyStock = {
  id: string;
  productId: string;
  stockDate: Date;        // Stock date (e.g., 2025-09-01)
  initialStock: number;   // Initial stock for the day
  stockIn: number;        // Stock received during the day
  stockOut: number;       // Stock out (usually = sales)
  finalStock: number;     // Final stock = initial + in - out
  createdAt: Date;
}

// ❌ WRONG - Indonesian naming
export type DailyStock = {
  id: string;
  productId: string;
  tanggalStok: Date;      // Tanggal stok
  stockAwal: number;      // Stok awal hari itu
  stockMasuk: number;     // Stok masuk hari itu
  stockKeluar: number;    // Stok keluar
  stockAkhir: number;     // Stok akhir
  createdAt: Date;
}
```

### 🌐 Multi-Language UI (i18n)

UI text must use the internationalization (i18n) system:

```typescript
// ✅ CORRECT - Using i18n
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function Page() {
  const { t } = useLanguage()

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome')}</p>
    </div>
  )
}

// ❌ WRONG - Hardcoded Indonesian text
export default function Page() {
  return (
    <div>
      <h1>Dasbor</h1>
      <p>Selamat datang di sistem POS</p>
    </div>
  )
}
```

## TypeScript Naming Conventions

### Variables & Constants

```typescript
// camelCase for variables
const userName = 'John Doe'
const totalAmount = 150000
const isActive = true

// UPPER_SNAKE_CASE for constants
const MAX_RETRY_ATTEMPTS = 3
const DEFAULT_PAGE_SIZE = 50
const API_BASE_URL = 'https://api.example.com'
```

### Functions & Methods

```typescript
// camelCase for functions
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// Descriptive names with verbs
async function fetchUserData(userId: string): Promise<User> {
  // Implementation
}

function validateEmail(email: string): boolean {
  // Implementation
}
```

### Types & Interfaces

```typescript
// PascalCase for types and interfaces
export type User = {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>
  save(product: Product): Promise<void>
  delete(id: string): Promise<void>
}

// Enums
export enum UserRole {
  Admin = 'admin',
  Cashier = 'cashier',
  Manager = 'manager',
}
```

### React Components

```typescript
// PascalCase for component names
export default function ProductList() {
  return <div>...</div>
}

// Props interface with "Props" suffix
interface ProductCardProps {
  product: Product
  onSelect: (id: string) => void
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return <div>...</div>
}
```

### Files & Directories

```
// PascalCase for component files
src/components/ui/Button.tsx
src/components/layout/Sidebar.tsx

// camelCase for utility files
src/lib/utils/formatters.ts
src/lib/utils/validators.ts

// lowercase for route directories (Next.js convention)
src/app/(app)/dashboard/page.tsx
src/app/api/products/route.ts
```

## Comments & Documentation

### JSDoc Comments

Always write JSDoc in English:

```typescript
/**
 * Create a new audit log entry
 *
 * @param data - Audit log data containing user, action, and entity info
 * @returns Promise that resolves when log is created
 * @throws Error if log creation fails
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  // Implementation
}
```

### Inline Comments

```typescript
// ✅ CORRECT - English comments
// Calculate final stock based on initial + in - out
const finalStock = initialStock + stockIn - stockOut

// Validate business logic
if (finalStock < 0) {
  throw new Error('Final stock cannot be negative')
}

// ❌ WRONG - Indonesian comments
// Hitung stok akhir berdasarkan awal + masuk - keluar
const finalStock = initialStock + stockIn - stockOut

// Validasi logika bisnis
if (finalStock < 0) {
  throw new Error('Stok akhir tidak boleh negatif')
}
```

## Database Schema

**IMPORTANT**: Database column names should remain stable to avoid breaking changes.

```typescript
// ⚠️ Database columns can use existing names (mixed language) to avoid migrations
// BUT new columns should use English naming

// Existing (keep as-is to avoid breaking changes)
stockAwal: number  // Don't rename - breaking change
stockAkhir: number // Don't rename - breaking change

// New columns (use English)
initialStock: number
finalStock: number
```

## Error Messages

Error messages in code should be in English, but can be translated in the UI layer:

```typescript
// ✅ CORRECT - English error messages
if (stockAkhir !== stockAwal + stockIn - stockOut) {
  throw new Error('Final stock does not match calculation: initial + in - out')
}

// For user-facing errors, use i18n
throw new Error(t('errors.invalidStock'))

// ❌ WRONG - Indonesian error messages in code
if (stockAkhir !== stockAwal + stockIn - stockOut) {
  throw new Error('Stock akhir tidak sesuai dengan perhitungan')
}
```

## Code Organization

### Import Statements

```typescript
// Group imports: external → internal → relative
import { useState, useEffect } from 'react'
import { z } from 'zod'

import { trpc } from '@/lib/trpc/client'
import { formatCurrency } from '@/lib/utils/formatters'

import { Card } from './Card'
import type { Product } from './types'
```

### Function Organization

```typescript
// Public exports first, private helpers last
export async function createProduct(input: CreateProductInput): Promise<Product> {
  validateProductInput(input)
  const product = buildProduct(input)
  return await saveProduct(product)
}

// Private helper functions below
function validateProductInput(input: CreateProductInput): void {
  // Validation logic
}

function buildProduct(input: CreateProductInput): Product {
  // Build logic
}

async function saveProduct(product: Product): Promise<Product> {
  // Save logic
}
```

## ESLint & Prettier

The project uses ESLint and Prettier for code quality:

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "default",
        "format": ["camelCase"]
      },
      {
        "selector": "variable",
        "format": ["camelCase", "UPPER_CASE"]
      },
      {
        "selector": "typeLike",
        "format": ["PascalCase"]
      }
    ]
  }
}
```

## Best Practices

### 1. Descriptive Names

```typescript
// ✅ GOOD - Descriptive
const userRegistrationDate = new Date()
const isEmailVerified = true
const calculateTotalRevenue = () => { }

// ❌ BAD - Too short or unclear
const d = new Date()
const flag = true
const calc = () => { }
```

### 2. Boolean Variables

```typescript
// Prefix with is, has, should, can
const isLoading = true
const hasPermission = false
const shouldRefresh = true
const canEdit = false
```

### 3. Function Names

```typescript
// Use verbs for functions
function fetchData() { }
function validateInput() { }
function createUser() { }
function deleteProduct() { }

// Use descriptive names for handlers
function handleSubmit() { }
function handleChange() { }
function handleClick() { }
```

### 4. Avoid Magic Numbers

```typescript
// ✅ GOOD - Named constants
const MAX_LOGIN_ATTEMPTS = 3
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

if (loginAttempts > MAX_LOGIN_ATTEMPTS) {
  lockAccount()
}

// ❌ BAD - Magic numbers
if (loginAttempts > 3) {
  lockAccount()
}
```

## Migration Strategy

For existing code with Indonesian naming:

1. **New Code**: Must follow English-only conventions
2. **Comments**: Update to English when touching files
3. **Variable Names**: Update when refactoring (safe)
4. **Database Columns**: Only rename if non-breaking or during major version
5. **API Contracts**: Avoid renaming (breaking change)

## Enforcement

- **Code Reviews**: Reviewers should check for English-only naming
- **ESLint**: Configure rules for naming conventions
- **Documentation**: Keep this guide updated
- **Team Training**: Share with all developers

## References

- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Next.js Documentation](https://nextjs.org/docs)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## Summary

**Golden Rule**: Write code in English, write UI in any language using i18n.

- ✅ Code elements (variables, functions, comments) → **English only**
- ✅ UI text (labels, messages, content) → **i18n system**
- ✅ Database columns (new) → **English preferred**
- ⚠️ Database columns (existing) → **Keep as-is unless safe to change**

By following these conventions, we ensure:
- **Consistency** across the codebase
- **Readability** for international developers
- **Maintainability** for long-term project health
- **Multi-language UI** support via i18n system
