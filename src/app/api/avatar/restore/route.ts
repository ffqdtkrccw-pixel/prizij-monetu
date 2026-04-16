import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// PRIVACY: obnova identity podle backup klíče — nevyžaduje žádné osobní údaje
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { backup_key } = body

  if (!backup_key || typeof backup_key !== 'string') {
    return NextResponse.json({ error: 'Chybí backup klíč' }, { status: 400 })
  }

  const supabase = getSupabaseServiceClient()

  const { data, error } = await supabase
    .from('avatars')
    .select('id, display_name, level, xp, morale, energy, burnout, flex, overtime_mins, loyalty, influence_score, unlocked_abilities, created_at')
    .eq('backup_key', backup_key.toUpperCase())
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Klíč nenalezen. Zkontroluj překlepy.' }, { status: 404 })
  }

  return NextResponse.json(data)
}
