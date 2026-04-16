import { create } from 'zustand'
import { BossStav, BossEvent, Season, DenniRozuzleni } from '@/types/game'

interface GameStore {
  boss: BossStav | null
  activeEvents: BossEvent[]
  currentSeason: Season | null
  todayResolution: DenniRozuzleni | null
  todayDamage: number
  todayControl: number
  isResolutionLoading: boolean

  setBoss: (b: BossStav) => void
  setActiveEvents: (e: BossEvent[]) => void
  setCurrentSeason: (s: Season) => void
  setTodayResolution: (r: DenniRozuzleni) => void
  updateBossHP: (newHP: number) => void
  setTodayDamage: (d: number) => void
  setTodayControl: (c: number) => void
  setResolutionLoading: (v: boolean) => void
}

export const useGameStore = create<GameStore>((set) => ({
  boss: null,
  activeEvents: [],
  currentSeason: null,
  todayResolution: null,
  todayDamage: 0,
  todayControl: 0,
  isResolutionLoading: false,

  setBoss: (b) => set({ boss: b }),
  setActiveEvents: (e) => set({ activeEvents: e }),
  setCurrentSeason: (s) => set({ currentSeason: s }),
  setTodayResolution: (r) => set({ todayResolution: r }),
  updateBossHP: (newHP) => set((state) => ({
    boss: state.boss ? { ...state.boss, controlLevel: newHP } : null,
  })),
  setTodayDamage: (d) => set({ todayDamage: d }),
  setTodayControl: (c) => set({ todayControl: c }),
  setResolutionLoading: (v) => set({ isResolutionLoading: v }),
}))
