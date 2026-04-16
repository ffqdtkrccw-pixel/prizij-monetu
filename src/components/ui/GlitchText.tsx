'use client'

import { ReactNode } from 'react'

interface GlitchTextProps {
  children: ReactNode
  className?: string
  intensity?: 'low' | 'medium' | 'high'
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div'
}

export function GlitchText({ children, className = '', intensity = 'low', as: Tag = 'span' }: GlitchTextProps) {
  const intensityClass = {
    low: 'glitch-low',
    medium: 'glitch-medium',
    high: 'glitch-high',
  }[intensity]

  return (
    <Tag className={`glitch-text ${intensityClass} ${className}`} data-text={String(children)}>
      {children}
    </Tag>
  )
}
