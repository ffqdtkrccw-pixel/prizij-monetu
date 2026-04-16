'use client'

import { useGameStore } from '@/store/gameStore'
import { MonospaceCard } from '@/components/ui/MonospaceCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { GlitchText } from '@/components/ui/GlitchText'
import { EventList } from './EventList'

export function BossPanel() {
  const boss = useGameStore(s => s.boss)
  const activeEvents = useGameStore(s => s.activeEvents)

  if (!boss) {
    return (
      <MonospaceCard glow="red" className="p-4">
        <div className="text-gray-600 font-mono text-sm animate-pulse">
          Načítám stav nepřítele...
        </div>
      </MonospaceCard>
    )
  }

  const hpColor = boss.controlLevel > 60 ? 'threat' :
                  boss.controlLevel > 30 ? 'burnout' : 'success'

  const aggressionLabel = [
    '', 'Klidný', 'Opatrný', 'Aktivní', 'Bdělý', 'Zvýšený',
    'Agresivní', 'Hrozivý', 'Nebezpečný', 'Kritický', 'MAXIMUM',
  ][boss.aggression] || '???'

  return (
    <MonospaceCard glow="red" className="p-4 space-y-4">
      {/* Hlavička */}
      <div className="flex items-start justify-between">
        <div>
          <GlitchText
            as="h2"
            intensity={boss.controlLevel < 30 ? 'high' : boss.controlLevel < 60 ? 'medium' : 'low'}
            className="text-red-400 font-bold text-lg font-mono"
          >
            {boss.name}
          </GlitchText>
          <div className="text-xs text-gray-600 font-mono mt-0.5">
            Senior VP of Control & Alignment
          </div>
        </div>
        <div className="text-right">
          <div className={`text-xs font-mono font-bold ${
            boss.aggression >= 7 ? 'text-red-500 animate-pulse' :
            boss.aggression >= 4 ? 'text-yellow-500' : 'text-gray-500'
          }`}>
            AGGRESSION
          </div>
          <div className={`text-sm font-mono font-bold ${
            boss.aggression >= 7 ? 'text-red-400' :
            boss.aggression >= 4 ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            {aggressionLabel}
          </div>
        </div>
      </div>

      {/* HP bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">
            Kontrola systému
          </span>
          <span className={`text-xs font-mono font-bold tabular-nums ${
            boss.controlLevel > 60 ? 'text-red-400' :
            boss.controlLevel > 30 ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {boss.controlLevel}/100
          </span>
        </div>
        <ProgressBar
          value={boss.controlLevel}
          variant={hpColor}
          animated
        />
      </div>

      {/* Flavor text */}
      {boss.flavorText && (
        <div className="text-xs text-gray-600 font-mono italic border-l-2 border-red-900/40 pl-2 leading-relaxed">
          {boss.flavorText}
        </div>
      )}

      {/* Aktivní eventy */}
      {activeEvents.length > 0 && (
        <div>
          <div className="text-xs text-gray-600 font-mono uppercase tracking-widest mb-2">
            Aktivní direktivy [{activeEvents.length}]
          </div>
          <EventList events={activeEvents} />
        </div>
      )}

      {activeEvents.length === 0 && (
        <div className="text-xs text-gray-700 font-mono">
          Žádné aktivní direktivy. Buď ostražitý — to je příliš ticho.
        </div>
      )}
    </MonospaceCard>
  )
}
