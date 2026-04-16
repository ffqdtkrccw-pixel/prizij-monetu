'use client'

import { useEffect } from 'react'
import { useAvatar } from '@/hooks/useAvatar'
import { useBossRealtime } from '@/hooks/useBossRealtime'
import { useFeedRealtime } from '@/hooks/useFeedRealtime'
import { useGameStore } from '@/store/gameStore'

import { BossPanel } from '@/components/boss/BossPanel'
import { BossInterrupt } from '@/components/boss/BossInterrupt'
import { AvatarPanel } from '@/components/avatar/AvatarPanel'
import { DailyInput } from '@/components/daily/DailyInput'
import { DailyReport } from '@/components/daily/DailyReport'
import { Feed } from '@/components/feed/Feed'
import { Leaderboard } from '@/components/leaderboard/Leaderboard'
import { GlitchText } from '@/components/ui/GlitchText'

function GameContent() {
  const { setBoss, setActiveEvents, setCurrentSeason } = useGameStore()
  const season = useGameStore(s => s.currentSeason)

  // Inicializuj avatara (anonymní identita)
  useAvatar()

  // Načti boss stav při startu
  useEffect(() => {
    fetch('/api/boss')
      .then(r => r.json())
      .then(data => {
        if (data.boss) {
          setBoss({
            id: data.boss.id,
            seasonId: data.boss.season_id,
            name: data.boss.name,
            controlLevel: data.boss.control_level,
            aggression: data.boss.aggression,
            adaptation: data.boss.adaptation,
            flavorText: data.boss.flavor_text,
            updatedAt: data.boss.updated_at,
          })
        }
        if (data.activeEvents) {
          setActiveEvents(data.activeEvents.map((e: Record<string, unknown>) => ({
            id: String(e.id),
            seasonId: String(e.season_id),
            title: String(e.title),
            description: String(e.description),
            category: String(e.category) as 'realisticky' | 'bizarni',
            moraleDelta: Number(e.morale_delta),
            burnoutDelta: Number(e.burnout_delta),
            energyDelta: Number(e.energy_delta),
            flexDelta: Number(e.flex_delta),
            overtimeDelta: Number(e.overtime_delta),
            isActive: Boolean(e.is_active),
            expiresAt: e.expires_at as string | null,
            activatedAt: e.activated_at as string | null,
          })))
        }
        if (data.season) {
          setCurrentSeason({
            id: data.season.id,
            name: data.season.name,
            startsAt: data.season.starts_at,
            endsAt: data.season.ends_at,
            isActive: data.season.is_active,
          })
        }
      })
      .catch(() => {}) // Tiché selhání — Supabase nemusí být nakonfigurována
  }, [setBoss, setActiveEvents, setCurrentSeason])

  // Realtime subscriptions
  useBossRealtime(season?.id)
  useFeedRealtime(season?.id)

  return (
    <div className="min-h-screen bg-[#05050f]">
      {/* Boss Interrupt overlay */}
      <BossInterrupt />

      {/* Header */}
      <header className="border-b border-gray-900 px-4 py-3 flex items-center justify-between sticky top-0 bg-[#05050f]/95 backdrop-blur-sm z-40">
        <div className="flex items-center gap-3">
          <GlitchText
            as="h1"
            intensity="low"
            className="text-red-400 font-bold text-base font-mono uppercase tracking-widest"
          >
            Přežij Monetu
          </GlitchText>
          <span className="text-[10px] text-gray-700 font-mono hidden sm:inline">
            corporate survival game
          </span>
        </div>
        <div className="text-[10px] text-gray-800 font-mono">
          anonymous · no tracking · no data
        </div>
      </header>

      {/* Hlavní grid */}
      <main className="max-w-7xl mx-auto px-3 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-4">

          {/* LEVÝ SLOUPEC: Boss + Leaderboard */}
          <div className="space-y-4 order-2 lg:order-1">
            <BossPanel />
            <Leaderboard />
          </div>

          {/* STŘEDNÍ SLOUPEC: Avatar + Check-in/Report */}
          <div className="space-y-4 order-1 lg:order-2">
            <AvatarPanel />
            <DailyReport />
            <DailyInput />
          </div>

          {/* PRAVÝ SLOUPEC: Feed */}
          <div className="order-3">
            <Feed />
          </div>
        </div>
      </main>

      {/* Footer — minimální, bez trackerů */}
      <footer className="border-t border-gray-900 px-4 py-3 mt-8 text-center">
        <p className="text-[10px] text-gray-800 font-mono">
          Přežij Monetu · anonymní · žádná data · žádné cookies · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}

export default function HomePage() {
  return <GameContent />
}
