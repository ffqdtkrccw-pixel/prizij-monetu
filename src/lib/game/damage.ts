import { BossEvent } from '@/types/game'
import { ZAKLADNI_KONTROLA, INAKTIVITA_POKUTA, INAKTIVITA_PRAHY, REAKCE_VAHY } from '@/lib/constants'

export interface DenniCheckinZaznam {
  damage_contrib: number
}

export interface ReakceZaznam {
  reaction_type: 'skull' | 'fire' | 'clown' | 'chart'
}

export function vypocitejPoškozeni(
  checkins: DenniCheckinZaznam[],
  reakce: ReakceZaznam[],
): number {
  const checkinDamage = checkins.reduce((sum, c) => sum + c.damage_contrib, 0)
  const reakceDamage = reakce.reduce((sum, r) => sum + (REAKCE_VAHY[r.reaction_type] ?? 0), 0)
  return checkinDamage + reakceDamage
}

export function vypocitejKontrolu(
  aktivniEventy: BossEvent[],
  pocetCheckins: number,
): number {
  const eventImpact = aktivniEventy.reduce((sum, e) => {
    return sum + Math.abs(e.moraleDelta) + Math.abs(e.burnoutDelta)
  }, 0)
  const inaktivitaPenalta = pocetCheckins < INAKTIVITA_PRAHY
    ? (INAKTIVITA_PRAHY - pocetCheckins) * INAKTIVITA_POKUTA
    : 0
  return ZAKLADNI_KONTROLA + eventImpact + inaktivitaPenalta
}

export function vypocitejCheckinDamage(
  overtimeMins: number,
  dayRating: 'skull' | 'fire' | 'clown' | 'chart',
): number {
  // Přesčas a negativní hodnocení = větší damage na systém
  const overtimeBonus = Math.min(Math.floor(overtimeMins / 30), 10)
  const ratingBonus: Record<string, number> = {
    skull: 15,
    fire:  10,
    clown: 7,
    chart: 5,
  }
  return 5 + (ratingBonus[dayRating] ?? 5) + overtimeBonus
}
