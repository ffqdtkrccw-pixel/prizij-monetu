import { HodnoceniDne } from '@/types/avatar'
import { ReakceTyp } from '@/types/feed'

export const REAKCE_VAHY: Record<ReakceTyp, number> = {
  skull: 3,
  fire:  2,
  chart: 2,
  clown: 1,
}

export const MAX_DELKA_POSTU = 280
export const MAX_POSTY_ZA_DEN = 3
export const ZAKLADNI_KONTROLA = 10        // base boss control per day
export const INAKTIVITA_POKUTA = 3         // per missing checkin below threshold
export const INAKTIVITA_PRAHY = 5          // below X check-ins = penalty

export const HODNOCENI_XP: Record<HodnoceniDne, number> = {
  skull: 15,
  fire:  12,
  clown: 12,
  chart: 8,
}

export const HODNOCENI_STATY: Record<HodnoceniDne, {
  morale: number; energy: number; burnout: number
}> = {
  skull: { morale: -15, energy: -10, burnout: +20 },
  fire:  { morale:  -5, energy:  +5, burnout: +10 },
  clown: { morale:   0, energy:  -5, burnout:  +5 },
  chart: { morale: -10, energy: -10, burnout: +15 },
}

// XP potřebné pro daný level (index = level - 1)
export const XP_TABLE: number[] = [
  0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000,
  6500, 8200, 10200, 12500, 15200, 18200, 21700, 25700, 30300, 35500,
]

export const ABILITY_LEVELY: Record<string, number> = {
  reality_amplifier: 3,
  silent_resistance: 5,
  viral_spike:       7,
}

export const ABILITY_COOLDOWN_H: Record<string, number> = {
  reality_amplifier: 24,
  silent_resistance: 24,
  viral_spike:       48,
}

// Reakce cooldown v sekundách (anti-spam)
export const REAKCE_COOLDOWN_S = 30

// LocalStorage klíče
export const LS_AVATAR_ID   = 'prm_avatar_id'
export const LS_AVATAR_NAME = 'prm_avatar_name'
export const LS_BACKUP_KEY  = 'prm_backup_key'
export const LS_CHECKIN_DATUM = 'prm_checkin_datum'
export const LS_ABILITIES   = 'prm_abilities_cooldown'
