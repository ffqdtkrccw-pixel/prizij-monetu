'use client'

interface ProgressBarProps {
  value: number           // 0–100
  max?: number
  variant?: 'morale' | 'energy' | 'burnout' | 'threat' | 'success' | 'xp'
  label?: string
  showValue?: boolean
  animated?: boolean
  className?: string
}

const variantColors: Record<string, string> = {
  morale:  'bg-cyan-400',
  energy:  'bg-green-400',
  burnout: 'bg-red-500',
  threat:  'bg-red-600',
  success: 'bg-green-500',
  xp:      'bg-purple-500',
}

const variantBg: Record<string, string> = {
  morale:  'bg-cyan-900/30',
  energy:  'bg-green-900/30',
  burnout: 'bg-red-900/30',
  threat:  'bg-red-900/30',
  success: 'bg-green-900/30',
  xp:      'bg-purple-900/30',
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'morale',
  label,
  showValue = false,
  animated = true,
  className = '',
}: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  const barColor = variantColors[variant]
  const bgColor = variantBg[variant]

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">{label}</span>}
          {showValue && <span className="text-xs text-gray-300 font-mono">{value}</span>}
        </div>
      )}
      <div className={`h-2 rounded-full ${bgColor} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${barColor} ${animated ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
