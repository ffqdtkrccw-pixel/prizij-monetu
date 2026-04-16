'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantClasses: Record<string, string> = {
  primary: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)]',
  danger:  'bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30 hover:border-red-400 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)]',
  ghost:   'text-gray-400 hover:text-gray-200 hover:bg-white/5',
  outline: 'bg-transparent text-gray-300 border border-gray-600 hover:border-gray-400 hover:text-white',
}

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function CyberButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}: CyberButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        font-mono tracking-wide rounded
        transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        active:scale-95
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin text-xs">⟳</span>
          {children}
        </span>
      ) : children}
    </button>
  )
}
