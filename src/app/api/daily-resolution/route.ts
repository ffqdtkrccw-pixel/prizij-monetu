import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Tato route je volána Vercel Cronem (každý den 23:59 CET)
// nebo manuálně s CRON_SECRET hlavičkou
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Neautorizováno' }, { status: 401 })
  }

  const supabase = getSupabaseServiceClient()

  // Najdi aktivní sezónu
  const { data: season } = await supabase
    .from('seasons')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!season) {
    return NextResponse.json({ error: 'Žádná aktivní sezóna' }, { status: 404 })
  }

  // Spusť rozuzlení
  const { data, error } = await supabase
    .rpc('spust_denni_rozuzleni', { p_season_id: season.id })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const vysledek = data?.[0]

  // Aktualizuj aggression bosse pokud opakovaně vyhrajeme
  if (vysledek?.vysledek === 'win') {
    // Boss zvyšuje adaptaci při prohře
    await supabase
      .from('boss_state')
      .update({ adaptation: supabase.rpc('least', { a: 100, b: 0 }) })
      .eq('season_id', season.id)
  }

  return NextResponse.json({
    ok: true,
    result: vysledek?.vysledek,
    damage: vysledek?.poskozeni,
    control: vysledek?.kontrola,
  })
}
