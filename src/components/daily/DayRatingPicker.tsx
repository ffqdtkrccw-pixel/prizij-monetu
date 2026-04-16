'use client'

import { HodnoceniDne } from '@/types/avatar'

interface DayRatingPickerProps {
  value: HodnoceniDne | null
  onChange: (v: HodnoceniDne) => void
}

const HODNOCENI: { id: HodnoceniDne; emoji: string; popis: string; barva: string }[] = [
  { id: 'skull',  emoji: '💀', popis: 'Pohřební', barva: 'border-red-700 text-red-300 bg-red-950/30' },
  { id: 'fire',   emoji: '🔥', popis: 'Hořelo to', barva: 'border-orange-700 text-orange-300 bg-orange-950/30' },
  { id: 'clown',  emoji: '🤡', popis: 'Cirkus', barva: 'border-yellow-700 text-yellow-300 bg-yellow-950/30' },
  { id: 'chart',  emoji: '📉', popis: 'Klesající', barva: 'border-blue-700 text-blue-300 bg-blue-950/30' },
]

export function DayRatingPicker({ value, onChange }: DayRatingPickerProps) {
  return (
    <div>
      <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
        Jak byl den?
      </div>
      <div className="grid grid-cols-4 gap-2">
        {HODNOCENI.map(h => (
          <button
            key={h.id}
            onClick={() => onChange(h.id)}
            className={`flex flex-col items-center gap-1 px-2 py-3 rounded border font-mono text-xs transition-all duration-150
              ${value === h.id
                ? `${h.barva} scale-105 shadow-lg`
                : 'border-gray-800 text-gray-600 hover:border-gray-600 hover:text-gray-400'
              }`}
          >
            <span className="text-xl">{h.emoji}</span>
            <span className="text-[10px] uppercase tracking-wide">{h.popis}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
