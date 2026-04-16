'use client'

import { useEffect, useState } from 'react'
import { MonospaceCard } from '@/components/ui/MonospaceCard'

interface LeaderEntry {
  id: string
  display_name: string
  level: number
  influence_score: number
  burnout: number
  xp: number
}

const MEDAILE = ['🥇', '🥈', '🥉']

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => setEntries(data.leaderboard || []))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <MonospaceCard glow="purple" title="Žebříček odporu" className="">
      <div className="divide-y divide-gray-900">
        {isLoading && (
          <div className="px-3 py-4 text-xs text-gray-700 font-mono animate-pulse">
            Načítám ranky...
          </div>
        )}

        {!isLoading && entries.length === 0 && (
          <div className="px-3 py-4 text-xs text-gray-700 font-mono text-center">
            Žádní bojovníci zatím. Buď první.
          </div>
        )}

        {entries.map((entry, i) => (
          <div key={entry.id} className="px-3 py-2 flex items-center gap-2 hover:bg-white/[0.02]">
            <span className="text-xs font-mono w-5 shrink-0 text-center">
              {i < 3 ? MEDAILE[i] : <span className="text-gray-700">{i + 1}</span>}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono text-gray-300 truncate">
                {entry.display_name}
              </div>
              <div className="text-[10px] text-gray-700 font-mono">
                LVL {entry.level} · {entry.xp.toLocaleString('cs')} XP
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-mono font-bold text-purple-400">
                {entry.influence_score.toLocaleString('cs')}
              </div>
              {entry.burnout > 70 && (
                <div className="text-[10px] text-red-500 font-mono">🔥burnout</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </MonospaceCard>
  )
}
