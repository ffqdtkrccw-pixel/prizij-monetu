export type HodnoceniDne = 'skull' | 'fire' | 'clown' | 'chart'
export type AbilityId = 'reality_amplifier' | 'silent_resistance' | 'viral_spike'

export interface AvatarStats {
  morale: number        // 0–100: morálka
  energy: number        // 0–100: energie
  burnout: number       // 0–100: vyhoření
  flex: number          // akumuluje se, home-office benefit
  overtimeMins: number  // celkový přesčas
  loyalty: number       // 0–100: loajalita k „systému"
}

export interface Avatar {
  id: string
  displayName: string
  level: number
  xp: number
  xpToNext: number
  stats: AvatarStats
  influenceScore: number
  unlockedAbilities: AbilityId[]
  hasDoneCheckinToday: boolean
  lastCheckinDate: string | null
  backupKey: string
  createdAt: string
}

export interface StatDelta {
  morale?: number
  energy?: number
  burnout?: number
  flex?: number
  overtimeMins?: number
  loyalty?: number
}
