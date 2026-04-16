'use client'

import { useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useGameStore } from '@/store/gameStore'
import { useUIStore } from '@/store/uiStore'
import { BossEvent } from '@/types/game'

export function useBossRealtime(seasonId: string | undefined) {
  const { setBoss, setActiveEvents } = useGameStore()
  const { triggerBossInterrupt, isCheckinInProgress } = useUIStore()

  useEffect(() => {
    if (!seasonId) return
    const supabase = getSupabaseClient()

    // Sleduj změny HP bosse
    const bossChannel = supabase
      .channel(`boss_state_${seasonId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'boss_state',
          filter: `season_id=eq.${seasonId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const novo = payload.new
          setBoss({
            id: String(novo.id),
            seasonId: String(novo.season_id),
            name: String(novo.name),
            controlLevel: Number(novo.control_level),
            aggression: Number(novo.aggression),
            adaptation: Number(novo.adaptation),
            flavorText: novo.flavor_text as string | null,
            updatedAt: String(novo.updated_at),
          })
        }
      )
      .subscribe()

    // Sleduj aktivaci eventů
    const eventChannel = supabase
      .channel(`boss_events_${seasonId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'boss_events',
          filter: `season_id=eq.${seasonId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const novo = payload.new
          const stare = payload.old

          const event: BossEvent = {
            id: String(novo.id),
            seasonId: String(novo.season_id),
            title: String(novo.title),
            description: String(novo.description),
            category: String(novo.category) as 'realisticky' | 'bizarni',
            moraleDelta: Number(novo.morale_delta),
            burnoutDelta: Number(novo.burnout_delta),
            energyDelta: Number(novo.energy_delta),
            flexDelta: Number(novo.flex_delta),
            overtimeDelta: Number(novo.overtime_delta),
            isActive: Boolean(novo.is_active),
            expiresAt: novo.expires_at as string | null,
            activatedAt: novo.activated_at as string | null,
          }

          // Nově aktivovaný event → Boss Interrupt
          if (novo.is_active && !stare.is_active && !isCheckinInProgress) {
            triggerBossInterrupt(event)
          }

          // Aktualizuj seznam aktivních eventů
          const current = useGameStore.getState().activeEvents
          if (novo.is_active) {
            const filtered = current.filter(e => e.id !== event.id)
            setActiveEvents([...filtered, event])
          } else {
            setActiveEvents(current.filter(e => e.id !== event.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(bossChannel)
      supabase.removeChannel(eventChannel)
    }
  }, [seasonId, setBoss, setActiveEvents, triggerBossInterrupt, isCheckinInProgress])
}
