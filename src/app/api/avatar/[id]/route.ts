import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

// Veřejný profil avatara — pouze herní data, žádné osobní údaje
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('avatars')
    .select('id, display_name, level, xp, morale, energy, burnout, flex, overtime_mins, loyalty, influence_score, unlocked_abilities, last_checkin_at, created_at')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Avatar nenalezen' }, { status: 404 })
  }

  return NextResponse.json(data)
}
