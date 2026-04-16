import { AvatarStats, StatDelta } from '@/types/avatar'
import { BossEvent } from '@/types/game'
import { HODNOCENI_STATY } from '@/lib/constants'
import { CheckinVstup } from './xp'

export function clampStaty(stats: AvatarStats): AvatarStats {
  return {
    morale:      Math.max(0, Math.min(100, stats.morale)),
    energy:      Math.max(0, Math.min(100, stats.energy)),
    burnout:     Math.max(0, Math.min(100, stats.burnout)),
    flex:        Math.max(0, stats.flex),
    overtimeMins: Math.max(0, stats.overtimeMins),
    loyalty:     Math.max(0, Math.min(100, stats.loyalty)),
  }
}

export function aplikujCheckin(
  current: AvatarStats,
  vstup: CheckinVstup,
  aktivniEventy: BossEvent[],
): { novéStaty: AvatarStats; delta: StatDelta } {
  const hodnoceniDelta = HODNOCENI_STATY[vstup.dayRating]

  // Přesčas → burnout roste
  const preseasBurnout = Math.floor(vstup.overtimeMins / 60) * 5

  // Home office → flex benefit
  const hoFlex = vstup.homeOfficeDays * 10

  // Eventy aplikovat
  const eventDelta: StatDelta = aktivniEventy.reduce((acc, event) => ({
    morale:  (acc.morale  ?? 0) + event.moraleDelta,
    energy:  (acc.energy  ?? 0) + event.energyDelta,
    burnout: (acc.burnout ?? 0) + event.burnoutDelta,
    flex:    (acc.flex    ?? 0) + event.flexDelta,
    overtimeMins: (acc.overtimeMins ?? 0) + event.overtimeDelta,
  }), {} as StatDelta)

  const delta: StatDelta = {
    morale:  hodnoceniDelta.morale  + (eventDelta.morale  ?? 0),
    energy:  hodnoceniDelta.energy  + (eventDelta.energy  ?? 0),
    burnout: hodnoceniDelta.burnout + preseasBurnout + (eventDelta.burnout ?? 0),
    flex:    hoFlex + (eventDelta.flex ?? 0),
    overtimeMins: vstup.overtimeMins,
  }

  const novéStaty = clampStaty({
    morale:      current.morale      + (delta.morale      ?? 0),
    energy:      current.energy      + (delta.energy      ?? 0),
    burnout:     current.burnout     + (delta.burnout     ?? 0),
    flex:        current.flex        + (delta.flex        ?? 0),
    overtimeMins: current.overtimeMins + (delta.overtimeMins ?? 0),
    loyalty:     current.loyalty,
  })

  return { novéStaty, delta }
}

export function aplikujVysledekDne(
  current: AvatarStats,
  result: 'win' | 'lose' | 'draw',
): { novéStaty: AvatarStats; delta: StatDelta } {
  const delty: Record<string, StatDelta> = {
    win:  { morale: +5,  burnout: -2, energy: +3 },
    lose: { morale: -5,  burnout: +8, energy: -3 },
    draw: { morale: 0,   burnout: +2, energy: 0  },
  }
  const delta = delty[result]
  const novéStaty = clampStaty({
    ...current,
    morale:  current.morale  + (delta.morale  ?? 0),
    energy:  current.energy  + (delta.energy  ?? 0),
    burnout: current.burnout + (delta.burnout ?? 0),
  })
  return { novéStaty, delta }
}
