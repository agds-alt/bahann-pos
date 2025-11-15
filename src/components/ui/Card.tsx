import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', padding = 'md', className = '', ...props }, ref) => {
    const baseStyles = `
      bg-white rounded-2xl
      transition-all duration-200
    `

    const variantStyles = {
      default: `
        shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]
        border-2 border-gray-200
        hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)]
        hover:translate-x-[-2px] hover:translate-y-[-2px]
      `,
      elevated: `
        shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)]
        border-2 border-gray-300
      `,
      flat: `
        shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]
        border-2 border-gray-100
      `,
    }

    const paddingStyles = {
      none: '',
      sm: 'p-3 sm:p-4',
      md: 'p-4 sm:p-6',
      lg: 'p-5 sm:p-8',
    }

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

/**
 * Card Header Component
 */
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`mb-4 ${className}`} {...props}>
        {children}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

/**
 * Card Title Component
 */
export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <h3 ref={ref} className={`text-lg sm:text-xl md:text-2xl font-bold text-gray-900 ${className}`} {...props}>
        {children}
      </h3>
    )
  }
)

CardTitle.displayName = 'CardTitle'

/**
 * Card Body Component
 */
export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`${className}`} {...props}>
        {children}
      </div>
    )
  }
)

CardBody.displayName = 'CardBody'
