import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabaseServerClient()

  // Aktivní sezóna
  const { data: season } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .single()

  if (!season) {
    return NextResponse.json({ error: 'Žádná aktivní sezóna' }, { status: 404 })
  }

  // Boss stav
  const { data: boss } = await supabase
    .from('boss_state')
    .select('*')
    .eq('season_id', season.id)
    .single()

  // Aktivní eventy
  const { data: events } = await supabase
    .from('boss_events')
    .select('*')
    .eq('season_id', season.id)
    .eq('is_active', true)
    .order('activated_at', { ascending: false })

  // Dnešní výsledek (pokud existuje)
  const dnes = new Date().toISOString().slice(0, 10)
  const { data: resolution } = await supabase
    .from('daily_resolutions')
    .select('*')
    .eq('season_id', season.id)
    .eq('resolution_date', dnes)
    .single()

  return NextResponse.json({
    season,
    boss,
    activeEvents: events || [],
    todayResolution: resolution || null,
  })
}
