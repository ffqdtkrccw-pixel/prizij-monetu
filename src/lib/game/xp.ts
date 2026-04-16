import { HodnoceniDne } from '@/types/avatar'
import { XP_TABLE, HODNOCENI_XP } from '@/lib/constants'

export interface CheckinVstup {
  officeDays: number
  homeOfficeDays: number
  overtimeMins: number
  dayRating: HodnoceniDne
}

export function xpZaCheckin(vstup: CheckinVstup): number {
  const zakladXP = 10
  const hodnoceniXP = HODNOCENI_XP[vstup.dayRating]
  const preseasXP = Math.min(Math.floor(vstup.overtimeMins / 30) * 2, 20) // max +20 za přesčas
  return zakladXP + hodnoceniXP + preseasXP
}

export function xpZaReakci(type: 'skull' | 'fire' | 'clown' | 'chart'): number {
  const mapa = { skull: 3, fire: 2, chart: 2, clown: 1 }
  return mapa[type]
}

export function levelZXP(xp: number): { level: number; xpToNext: number; progress: number } {
  let level = 1
  for (let i = 1; i < XP_TABLE.length; i++) {
    if (xp >= XP_TABLE[i]) {
      level = i + 1
    } else {
      break
    }
  }
  const maxLevel = XP_TABLE.length
  if (level >= maxLevel) {
    return { level: maxLevel, xpToNext: 0, progress: 100 }
  }
  const xpProTento = XP_TABLE[level - 1]
  const xpProDalsi = XP_TABLE[level]
  const progress = Math.round(((xp - xpProTento) / (xpProDalsi - xpProTento)) * 100)
  return { level, xpToNext: xpProDalsi - xp, progress }
}
