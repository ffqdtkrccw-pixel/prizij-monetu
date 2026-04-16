import { REAKCE_VAHY } from '@/lib/constants'

const MAX_INFLUENCE = 10000

export function velocityFaktor(timestampy: Date[]): number {
  if (timestampy.length === 0) return 1.0
  const nyni = Date.now()
  const poslednich24h = timestampy.filter(t => nyni - t.getTime() < 24 * 3600 * 1000).length
  const prumer7dni = timestampy.filter(t => nyni - t.getTime() < 7 * 24 * 3600 * 1000).length / 7
  if (prumer7dni === 0) return 1.0
  return Math.min(2.0, Math.max(1.0, poslednich24h / prumer7dni))
}

export function prepocitejInfluence(
  reakce: Array<{ reaction_type: keyof typeof REAKCE_VAHY }>,
  komentaruCelkem: number,
  timestampyPostu: Date[],
): number {
  const reakceScore = reakce.reduce((sum, r) => sum + (REAKCE_VAHY[r.reaction_type] ?? 0), 0)
  const komentareScore = komentaruCelkem * 2
  const velocity = velocityFaktor(timestampyPostu)
  const raw = (reakceScore + komentareScore) * velocity
  return Math.round(raw)
}

export function klesajiciVynosy(currentScore: number, increment: number): number {
  // Logaritmický klesající efekt pro anti-spam
  const factor = 1 - (currentScore / MAX_INFLUENCE) * 0.5
  return Math.round(increment * Math.max(0.1, factor))
}
