import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', fullWidth = false, className = '', disabled, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium rounded-xl
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
    `

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    const variantStyles = {
      primary: `
        bg-white text-gray-900
        shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]
        hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]
        active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]
        hover:translate-x-[-2px] hover:translate-y-[-2px]
        active:translate-x-[2px] active:translate-y-[2px]
        border-2 border-gray-200
      `,
      secondary: `
        bg-gray-100 text-gray-700
        shadow-[3px_3px_0px_0px_rgba(0,0,0,0.08)]
        hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.12)]
        active:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.08)]
        hover:translate-x-[-2px] hover:translate-y-[-2px]
        active:translate-x-[2px] active:translate-y-[2px]
        border-2 border-gray-300
      `,
      outline: `
        bg-transparent text-gray-900 border-2 border-gray-300
        shadow-[3px_3px_0px_0px_rgba(0,0,0,0.08)]
        hover:bg-white hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.12)]
        active:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.08)]
        hover:translate-x-[-2px] hover:translate-y-[-2px]
        active:translate-x-[2px] active:translate-y-[2px]
      `,
      danger: `
        bg-red-500 text-white
        shadow-[4px_4px_0px_0px_rgba(220,38,38,0.3)]
        hover:shadow-[6px_6px_0px_0px_rgba(220,38,38,0.4)]
        active:shadow-[2px_2px_0px_0px_rgba(220,38,38,0.3)]
        hover:translate-x-[-2px] hover:translate-y-[-2px]
        active:translate-x-[2px] active:translate-y-[2px]
        border-2 border-red-600
      `,
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
