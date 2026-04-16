import { create } from 'zustand'
import { Avatar, StatDelta } from '@/types/avatar'
import { LS_CHECKIN_DATUM } from '@/lib/constants'

interface AvatarStore {
  avatar: Avatar | null
  isLoading: boolean
  error: string | null

  setAvatar: (a: Avatar) => void
  updateStats: (delta: StatDelta) => void
  setCheckinDone: () => void
  addXP: (amount: number) => void
  setInfluenceScore: (score: number) => void
  setError: (msg: string | null) => void
  setLoading: (v: boolean) => void
  clear: () => void
}

export const useAvatarStore = create<AvatarStore>((set) => ({
  avatar: null,
  isLoading: true,
  error: null,

  setAvatar: (a) => set({ avatar: a }),

  updateStats: (delta) => set((state) => {
    if (!state.avatar) return state
    const s = state.avatar.stats
    return {
      avatar: {
        ...state.avatar,
        stats: {
          morale:      Math.max(0, Math.min(100, s.morale + (delta.morale ?? 0))),
          energy:      Math.max(0, Math.min(100, s.energy + (delta.energy ?? 0))),
          burnout:     Math.max(0, Math.min(100, s.burnout + (delta.burnout ?? 0))),
          flex:        Math.max(0, s.flex + (delta.flex ?? 0)),
          overtimeMins: Math.max(0, s.overtimeMins + (delta.overtimeMins ?? 0)),
          loyalty:     Math.max(0, Math.min(100, s.loyalty + (delta.loyalty ?? 0))),
        },
      },
    }
  }),

  setCheckinDone: () => {
    const dnes = new Date().toISOString().slice(0, 10)
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_CHECKIN_DATUM, dnes)
    }
    set((state) => ({
      avatar: state.avatar ? { ...state.avatar, hasDoneCheckinToday: true, lastCheckinDate: dnes } : null,
    }))
  },

  addXP: (amount) => set((state) => {
    if (!state.avatar) return state
    return {
      avatar: { ...state.avatar, xp: state.avatar.xp + amount },
    }
  }),

  setInfluenceScore: (score) => set((state) => ({
    avatar: state.avatar ? { ...state.avatar, influenceScore: score } : null,
  })),

  setError: (msg) => set({ error: msg }),
  setLoading: (v) => set({ isLoading: v }),
  clear: () => set({ avatar: null, isLoading: false, error: null }),
}))
