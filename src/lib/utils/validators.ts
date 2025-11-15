/**
 * Validation Utilities
 *
 * Common validation functions to ensure data integrity
 */

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns true if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 *
 * @param password - Password to validate
 * @returns Object with validation result and error message
 */
export function validatePassword(password: string): {
  isValid: boolean
  error?: string
} {
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
    }
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter',
    }
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter',
    }
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number',
    }
  }

  return { isValid: true }
}

/**
 * Validate Indonesian phone number
 *
 * @param phone - Phone number to validate
 * @returns true if phone number is valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Indonesian phone numbers: 08xx-xxxx-xxxx or +628xx-xxxx-xxxx
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/
  return phoneRegex.test(phone.replace(/[\s-]/g, ''))
}

/**
 * Validate positive number
 *
 * @param value - Value to validate
 * @returns true if value is a positive number
 */
export function isPositiveNumber(value: number | string): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(num) && num > 0
}

/**
 * Validate non-negative number (including zero)
 *
 * @param value - Value to validate
 * @returns true if value is non-negative
 */
export function isNonNegativeNumber(value: number | string): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(num) && num >= 0
}

/**
 * Sanitize string input (prevent XSS)
 *
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

/**
 * Sanitize HTML content (more aggressive)
 *
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

/**
 * Validate SKU format
 *
 * SKU must be alphanumeric with optional hyphens/underscores
 *
 * @param sku - SKU to validate
 * @returns true if SKU is valid
 */
export function isValidSKU(sku: string): boolean {
  const skuRegex = /^[A-Z0-9_-]+$/i
  return skuRegex.test(sku) && sku.length >= 3 && sku.length <= 50
}

/**
 * Check if date is in the past
 *
 * @param date - Date to check
 * @returns true if date is in the past
 */
export function isDateInPast(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj < new Date()
}

/**
 * Check if date is in the future
 *
 * @param date - Date to check
 * @returns true if date is in the future
 */
export function isDateInFuture(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj > new Date()
}

/**
 * Validate price value
 *
 * @param price - Price to validate
 * @returns Object with validation result and error message
 */
export function validatePrice(price: number | string): {
  isValid: boolean
  error?: string
} {
  const priceNum = typeof price === 'string' ? parseFloat(price) : price

  if (isNaN(priceNum)) {
    return { isValid: false, error: 'Price must be a valid number' }
  }

  if (priceNum < 0) {
    return { isValid: false, error: 'Price cannot be negative' }
  }

  if (priceNum > 1000000000) {
    // Max 1 billion
    return { isValid: false, error: 'Price exceeds maximum allowed value' }
  }

  return { isValid: true }
}

/**
 * Validate quantity value
 *
 * @param quantity - Quantity to validate
 * @returns Object with validation result and error message
 */
export function validateQuantity(quantity: number | string): {
  isValid: boolean
  error?: string
} {
  const qty = typeof quantity === 'string' ? parseInt(quantity) : quantity

  if (isNaN(qty) || !Number.isInteger(qty)) {
    return { isValid: false, error: 'Quantity must be a whole number' }
  }

  if (qty < 0) {
    return { isValid: false, error: 'Quantity cannot be negative' }
  }

  if (qty > 1000000) {
    // Max 1 million
    return { isValid: false, error: 'Quantity exceeds maximum allowed value' }
  }

  return { isValid: true }
}
