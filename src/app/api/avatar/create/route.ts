import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const avatarId = req.headers.get('X-Avatar-Id')
  if (!avatarId) {
    return NextResponse.json({ error: 'Chybí X-Avatar-Id' }, { status: 400 })
  }

  const body = await req.json()
  const { id, display_name, backup_key } = body

  if (id !== avatarId) {
    return NextResponse.json({ error: 'ID se neshoduje' }, { status: 400 })
  }

  const supabase = getSupabaseServiceClient()

  // Najdi aktivní sezónu
  const { data: season } = await supabase
    .from('seasons')
    .select('id')
    .eq('is_active', true)
    .single()

  const { error } = await supabase
    .from('avatars')
    .insert({
      id,
      display_name,
      backup_key,
      season_id: season?.id || null,
      level: 1,
      xp: 0,
      morale: 70,
      energy: 80,
      burnout: 10,
      flex: 0,
      overtime_mins: 0,
      loyalty: 50,
      influence_score: 0,
      unlocked_abilities: [],
    })

  if (error) {
    // Avatar už existuje — ok
    if (error.code === '23505') {
      return NextResponse.json({ ok: true, existing: true })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
