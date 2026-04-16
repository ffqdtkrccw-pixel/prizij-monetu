import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = getSupabaseServerClient()

  const { data: season } = await supabase
    .from('seasons')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!season) {
    return NextResponse.json({ leaderboard: [] })
  }

  const { data, error } = await supabase
    .from('avatars')
    .select('id, display_name, level, influence_score, burnout, xp')
    .eq('season_id', season.id)
    .order('influence_score', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ leaderboard: data || [] })
}
