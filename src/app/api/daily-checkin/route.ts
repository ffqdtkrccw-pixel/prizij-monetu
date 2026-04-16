import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { xpZaCheckin } from '@/lib/game/xp'
import { aplikujCheckin } from '@/lib/game/stats'
import { vypocitejCheckinDamage } from '@/lib/game/damage'
import { levelZXP } from '@/lib/game/xp'
import { HodnoceniDne } from '@/types/avatar'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const avatarId = req.headers.get('X-Avatar-Id')
  if (!avatarId) {
    return NextResponse.json({ error: 'Chybí X-Avatar-Id' }, { status: 401 })
  }

  const body = await req.json()
  const { office_days, home_office_days, overtime_mins, day_rating } = body

  if (!['skull', 'fire', 'clown', 'chart'].includes(day_rating)) {
    return NextResponse.json({ error: 'Neplatné hodnocení dne' }, { status: 400 })
  }

  const supabase = getSupabaseServiceClient()

  // Nastav session proměnnou pro RLS
  try {
    await supabase.rpc('set_config', {
      setting: 'app.avatar_id',
      value: avatarId,
      is_local: true,
    })
  } catch {
    // service_role má RLS bypass — ignoruj chybu
  }

  // Zkontroluj existující check-in pro dnešek
  const dnes = new Date().toISOString().slice(0, 10)
  const { data: existujici } = await supabase
    .from('daily_checkins')
    .select('id')
    .eq('avatar_id', avatarId)
    .eq('checkin_date', dnes)
    .single()

  if (existujici) {
    return NextResponse.json({ error: 'Dnes jsi už check-in provedl(a)' }, { status: 409 })
  }

  // Načti avatar
  const { data: avatar, error: avatarErr } = await supabase
    .from('avatars')
    .select('*')
    .eq('id', avatarId)
    .single()

  if (avatarErr || !avatar) {
    return NextResponse.json({ error: 'Avatar nenalezen' }, { status: 404 })
  }

  // Načti aktivní eventy
  const { data: eventy } = await supabase
    .from('boss_events')
    .select('*')
    .eq('season_id', avatar.season_id)
    .eq('is_active', true)

  const aktivniEventy = (eventy || []).map(e => ({
    id: e.id,
    seasonId: e.season_id,
    title: e.title,
    description: e.description,
    category: e.category,
    moraleDelta: e.morale_delta,
    burnoutDelta: e.burnout_delta,
    energyDelta: e.energy_delta,
    flexDelta: e.flex_delta,
    overtimeDelta: e.overtime_delta,
    isActive: e.is_active,
    expiresAt: e.expires_at,
    activatedAt: e.activated_at,
  }))

  const vstup = {
    officeDays: Number(office_days) || 0,
    homeOfficeDays: Number(home_office_days) || 0,
    overtimeMins: Number(overtime_mins) || 0,
    dayRating: day_rating as HodnoceniDne,
  }

  // Výpočty
  const xpGained = xpZaCheckin(vstup)
  const damageContrib = vypocitejCheckinDamage(vstup.overtimeMins, vstup.dayRating)
  const { novéStaty, delta } = aplikujCheckin(
    {
      morale: avatar.morale,
      energy: avatar.energy,
      burnout: avatar.burnout,
      flex: avatar.flex,
      overtimeMins: avatar.overtime_mins,
      loyalty: avatar.loyalty,
    },
    vstup,
    aktivniEventy,
  )

  const novéXP = (avatar.xp || 0) + xpGained
  const { level } = levelZXP(novéXP)

  // Zjisti schopnosti k odemnkutí
  const noveSchopnosti = [...(avatar.unlocked_abilities || [])]
  const ABILITY_LEVELY: Record<string, number> = {
    reality_amplifier: 3,
    silent_resistance: 5,
    viral_spike: 7,
  }
  for (const [abilityId, reqLevel] of Object.entries(ABILITY_LEVELY)) {
    if (level >= reqLevel && !noveSchopnosti.includes(abilityId)) {
      noveSchopnosti.push(abilityId)
    }
  }

  // Ulož check-in
  const { error: checkinErr } = await supabase
    .from('daily_checkins')
    .insert({
      avatar_id: avatarId,
      season_id: avatar.season_id,
      checkin_date: dnes,
      office_days: vstup.officeDays,
      home_office_days: vstup.homeOfficeDays,
      overtime_mins: vstup.overtimeMins,
      day_rating: vstup.dayRating,
      xp_gained: xpGained,
      damage_contrib: damageContrib,
      morale_delta: delta.morale ?? 0,
      energy_delta: delta.energy ?? 0,
      burnout_delta: delta.burnout ?? 0,
    })

  if (checkinErr) {
    if (checkinErr.code === '23505') {
      return NextResponse.json({ error: 'Dnes jsi už check-in provedl(a)' }, { status: 409 })
    }
    return NextResponse.json({ error: checkinErr.message }, { status: 500 })
  }

  // Aktualizuj avatar
  await supabase
    .from('avatars')
    .update({
      morale: novéStaty.morale,
      energy: novéStaty.energy,
      burnout: novéStaty.burnout,
      flex: novéStaty.flex,
      overtime_mins: novéStaty.overtimeMins,
      xp: novéXP,
      level,
      last_checkin_at: dnes,
      unlocked_abilities: noveSchopnosti,
    })
    .eq('id', avatarId)

  return NextResponse.json({
    ok: true,
    xpGained,
    damageContrib,
    delta,
    novéStaty,
    noveSchopnosti,
    level,
    xp: novéXP,
  })
}
