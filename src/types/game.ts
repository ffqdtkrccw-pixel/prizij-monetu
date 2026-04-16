export type EventKategorie = 'realisticky' | 'bizarni'

export interface BossStav {
  id: string
  seasonId: string
  name: string
  controlLevel: number   // 0–100, HP bosse
  aggression: number     // 1–10
  adaptation: number
  flavorText: string | null
  updatedAt: string
}

export interface BossEvent {
  id: string
  seasonId: string
  title: string
  description: string
  category: EventKategorie
  moraleDelta: number
  burnoutDelta: number
  energyDelta: number
  flexDelta: number
  overtimeDelta: number
  isActive: boolean
  expiresAt: string | null
  activatedAt: string | null
}

export interface Season {
  id: string
  name: string
  startsAt: string
  endsAt: string
  isActive: boolean
}

export interface DenniRozuzleni {
  id: string
  seasonId: string
  resolutionDate: string
  totalDamage: number
  totalControl: number
  result: 'win' | 'lose' | 'draw'
  activePlayers: number
  bossControlBefore: number
  bossControlAfter: number
  createdAt: string
}

export interface DenniReport {
  result: 'win' | 'lose' | 'draw'
  damage: number
  control: number
  xpGained: number
  bossHpBefore: number
  bossHpAfter: number
}
