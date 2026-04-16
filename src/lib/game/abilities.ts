import { AbilityId } from '@/types/avatar'
import { BossEvent } from '@/types/game'
import { ABILITY_COOLDOWN_H, LS_ABILITIES } from '@/lib/constants'

export interface AbilityDef {
  id: AbilityId
  nazev: string
  popis: string
  levelRequired: number
  cooldownH: number
  emoji: string
}

export const ABILITIES: AbilityDef[] = [
  {
    id: 'reality_amplifier',
    nazev: 'Reality Amplifier',
    popis: 'Tvé posty mají 1.5× větší dopad na damage. Protože pravda bolí víc.',
    levelRequired: 3,
    cooldownH: 24,
    emoji: '📡',
  },
  {
    id: 'silent_resistance',
    nazev: 'Silent Resistance',
    popis: 'Ignoruješ nejhorší aktivní event dneška. Interně. Navenek se usmíváš.',
    levelRequired: 5,
    cooldownH: 24,
    emoji: '🛡️',
  },
  {
    id: 'viral_spike',
    nazev: 'Viral Spike',
    popis: 'Tvůj příští post dostane boost viditelnosti. Šeptanda se šíří rychleji.',
    levelRequired: 7,
    cooldownH: 48,
    emoji: '🔥',
  },
]

export interface CooldownMapa {
  [abilityId: string]: string  // ISO timestamp posledního použití
}

export function nactiCooldownyZLS(): CooldownMapa {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(LS_ABILITIES)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function ulozCooldownDoLS(abilityId: AbilityId): void {
  if (typeof window === 'undefined') return
  const mapa = nactiCooldownyZLS()
  mapa[abilityId] = new Date().toISOString()
  localStorage.setItem(LS_ABILITIES, JSON.stringify(mapa))
}

export function jeVCooldownu(abilityId: AbilityId, cooldownMapa: CooldownMapa): boolean {
  const lastUsed = cooldownMapa[abilityId]
  if (!lastUsed) return false
  const cooldownMs = (ABILITY_COOLDOWN_H[abilityId] ?? 24) * 3600 * 1000
  return Date.now() - new Date(lastUsed).getTime() < cooldownMs
}

export function zbyvajiHodiny(abilityId: AbilityId, cooldownMapa: CooldownMapa): number {
  const lastUsed = cooldownMapa[abilityId]
  if (!lastUsed) return 0
  const cooldownMs = (ABILITY_COOLDOWN_H[abilityId] ?? 24) * 3600 * 1000
  const zbyvaMilisekund = cooldownMs - (Date.now() - new Date(lastUsed).getTime())
  return Math.max(0, Math.ceil(zbyvaMilisekund / 3600000))
}

export function aplikujSchopnosti(
  unlockedAbilities: AbilityId[],
  cooldownMapa: CooldownMapa,
  aktivniEventy: BossEvent[],
): {
  realityAmplifier: boolean
  silentResistance: boolean
  viralSpike: boolean
  blokovanyEvent: BossEvent | null
} {
  const realityAmplifier =
    unlockedAbilities.includes('reality_amplifier') && !jeVCooldownu('reality_amplifier', cooldownMapa)
  const silentResistance =
    unlockedAbilities.includes('silent_resistance') && !jeVCooldownu('silent_resistance', cooldownMapa)
  const viralSpike =
    unlockedAbilities.includes('viral_spike') && !jeVCooldownu('viral_spike', cooldownMapa)

  // Silent Resistance — zablokuje event s největším negativním dopadem
  let blokovanyEvent: BossEvent | null = null
  if (silentResistance && aktivniEventy.length > 0) {
    blokovanyEvent = aktivniEventy.reduce((worst, e) =>
      (e.moraleDelta + e.burnoutDelta) < (worst.moraleDelta + worst.burnoutDelta) ? e : worst
    )
  }

  return { realityAmplifier, silentResistance, viralSpike, blokovanyEvent }
}
