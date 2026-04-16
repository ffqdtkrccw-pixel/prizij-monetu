import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { REAKCE_VAHY } from '@/lib/constants'
import { ReakceTyp } from '@/types/feed'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const avatarId = req.headers.get('X-Avatar-Id')
  if (!avatarId) {
    return NextResponse.json({ error: 'Chybí X-Avatar-Id' }, { status: 401 })
  }

  const body = await req.json()
  const { reaction_type } = body

  if (!['skull', 'fire', 'clown', 'chart'].includes(reaction_type)) {
    return NextResponse.json({ error: 'Neplatný typ reakce' }, { status: 400 })
  }

  const supabase = getSupabaseServiceClient()
  const postId = params.id

  // Zkontroluj existující reakci (toggle)
  const { data: existujici } = await supabase
    .from('reactions')
    .select('id')
    .eq('post_id', postId)
    .eq('avatar_id', avatarId)
    .eq('reaction_type', reaction_type)
    .single()

  if (existujici) {
    // Toggle off — smaž reakci
    await supabase
      .from('reactions')
      .delete()
      .eq('id', existujici.id)

    return NextResponse.json({ ok: true, action: 'removed', reaction_type })
  }

  // Anti-spam: max 4 různé reakce per post per avatar (jedna každého typu)
  const weight = REAKCE_VAHY[reaction_type as ReakceTyp]

  const { error } = await supabase
    .from('reactions')
    .insert({
      post_id: postId,
      avatar_id: avatarId,
      reaction_type,
      weight,
    })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Reakci jsi již použil(a)' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Přepočítej influence (async, neblokuj odpověď)
  void supabase.rpc('prepocitej_influence', { p_avatar_id: avatarId })

  return NextResponse.json({ ok: true, action: 'added', reaction_type, weight })
}
