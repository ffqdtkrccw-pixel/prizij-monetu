'use client'

import { AbilityId } from '@/types/avatar'
import { ABILITIES, nactiCooldownyZLS, jeVCooldownu, zbyvajiHodiny } from '@/lib/game/abilities'
import { useState, useEffect } from 'react'

interface AbilityListProps {
  abilities: AbilityId[]
}

export function AbilityList({ abilities }: AbilityListProps) {
  const [cooldowny, setCooldowny] = useState(() => nactiCooldownyZLS())

  useEffect(() => {
    setCooldowny(nactiCooldownyZLS())
  }, [])

  const dostupne = ABILITIES.filter(a => abilities.includes(a.id))

  if (dostupne.length === 0) return null

  return (
    <div className="space-y-1.5">
      <div className="text-xs text-gray-600 font-mono uppercase tracking-widest pt-1">Schopnosti</div>
      {dostupne.map(ability => {
        const jeCooldown = jeVCooldownu(ability.id, cooldowny)
        const zbyvaji = zbyvajiHodiny(ability.id, cooldowny)

        return (
          <div
            key={ability.id}
            className={`flex items-center gap-2 px-2 py-1.5 rounded border text-xs font-mono ${
              jeCooldown
                ? 'border-gray-800 text-gray-600 bg-gray-900/20'
                : 'border-cyan-900/40 text-cyan-400 bg-cyan-950/20'
            }`}
          >
            <span>{ability.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{ability.nazev}</div>
              <div className="text-gray-600 text-[10px] truncate">{ability.popis}</div>
            </div>
            {jeCooldown && (
              <span className="text-red-500 text-[10px] shrink-0">{zbyvaji}h</span>
            )}
            {!jeCooldown && (
              <span className="text-green-500 text-[10px] shrink-0">READY</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
