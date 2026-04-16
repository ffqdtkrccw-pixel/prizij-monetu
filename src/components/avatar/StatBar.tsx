'use client'

import { ProgressBar } from '@/components/ui/ProgressBar'

interface StatBarProps {
  nazev: string
  hodnota: number
  varianta: 'morale' | 'energy' | 'burnout'
  ikona: string
}

export function StatBar({ nazev, hodnota, varianta, ikona }: StatBarProps) {
  // Vizuální mutace při extrémních hodnotách
  const jeKriticky = varianta === 'burnout' ? hodnota > 70 : hodnota < 30
  const jeVarujici = varianta === 'burnout' ? hodnota > 50 : hodnota < 50

  return (
    <div className={`${jeKriticky ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-mono flex items-center gap-1.5 ${
          jeKriticky ? 'text-red-400' : jeVarujici ? 'text-yellow-400' : 'text-gray-400'
        }`}>
          <span>{ikona}</span>
          <span className="uppercase tracking-wider">{nazev}</span>
        </span>
        <span className={`text-xs font-mono font-bold tabular-nums ${
          jeKriticky ? 'text-red-400 glitch-low' : 'text-gray-300'
        }`}>
          {hodnota}
        </span>
      </div>
      <ProgressBar
        value={hodnota}
        variant={jeKriticky && varianta !== 'burnout' ? 'burnout' : varianta}
        animated
      />
    </div>
  )
}
