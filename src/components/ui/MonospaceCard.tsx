import { ReactNode } from 'react'

interface MonospaceCardProps {
  children: ReactNode
  className?: string
  glow?: 'cyan' | 'red' | 'green' | 'purple' | 'none'
  title?: string
  titleRight?: ReactNode
}

const glowClasses: Record<string, string> = {
  cyan:   'border-cyan-800/50 hover:border-cyan-600/60',
  red:    'border-red-800/50 hover:border-red-600/60',
  green:  'border-green-800/50 hover:border-green-600/60',
  purple: 'border-purple-800/50 hover:border-purple-600/60',
  none:   'border-gray-800/50',
}

export function MonospaceCard({ children, className = '', glow = 'none', title, titleRight }: MonospaceCardProps) {
  return (
    <div className={`bg-[#0a0a14] border rounded-sm ${glowClasses[glow]} transition-all duration-200 ${className}`}>
      {(title || titleRight) && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/50">
          {title && (
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
              {title}
            </span>
          )}
          {titleRight}
        </div>
      )}
      {children}
    </div>
  )
}
