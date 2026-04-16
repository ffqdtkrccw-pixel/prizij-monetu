import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient, getSupabaseServerClient } from '@/lib/supabase/server'
import { MAX_DELKA_POSTU, MAX_POSTY_ZA_DEN } from '@/lib/constants'

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServerClient()
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor')
  const limit = 20

  // Aktivní sezóna
  const { data: season } = await supabase
    .from('seasons')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!season) {
    return NextResponse.json({ posts: [], cursor: null })
  }

  let query = supabase
    .from('posts')
    .select(`
      id, avatar_id, season_id, content, reaction_score, comment_count, is_boosted, created_at,
      avatars!inner(display_name)
    `)
    .eq('season_id', season.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data: posts, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const novyCursor = posts && posts.length === limit
    ? posts[posts.length - 1].created_at
    : null

  const transformovane = (posts || []).map((p) => ({
    id: p.id,
    avatarId: p.avatar_id,
    authorName: (p.avatars as unknown as { display_name: string })?.display_name || 'Neznámý',
    seasonId: p.season_id,
    content: p.content,
    reactionScore: p.reaction_score,
    commentCount: p.comment_count,
    isBoosted: p.is_boosted,
    createdAt: p.created_at,
  }))

  return NextResponse.json({ posts: transformovane, cursor: novyCursor })
}

export async function POST(req: NextRequest) {
  const avatarId = req.headers.get('X-Avatar-Id')
  if (!avatarId) {
    return NextResponse.json({ error: 'Chybí X-Avatar-Id' }, { status: 401 })
  }

  const body = await req.json()
  const { content } = body

  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Chybí obsah' }, { status: 400 })
  }

  const trimmed = content.trim()
  if (trimmed.length === 0 || trimmed.length > MAX_DELKA_POSTU) {
    return NextResponse.json({ error: `Post musí mít 1–${MAX_DELKA_POSTU} znaků` }, { status: 400 })
  }

  const supabase = getSupabaseServiceClient()

  // Zkontroluj denní limit postů
  const dnes = new Date().toISOString().slice(0, 10)
  const { count } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('avatar_id', avatarId)
    .gte('created_at', `${dnes}T00:00:00Z`)

  if ((count || 0) >= MAX_POSTY_ZA_DEN) {
    return NextResponse.json({ error: `Maximum ${MAX_POSTY_ZA_DEN} posty za den` }, { status: 429 })
  }

  // Aktivní sezóna
  const { data: season } = await supabase
    .from('seasons')
    .select('id')
    .eq('is_active', true)
    .single()

  // Zkontroluj Viral Spike schopnost
  const { data: avatar } = await supabase
    .from('avatars')
    .select('unlocked_abilities, display_name')
    .eq('id', avatarId)
    .single()

  const { error, data: post } = await supabase
    .from('posts')
    .insert({
      avatar_id: avatarId,
      season_id: season?.id || null,
      content: trimmed,
      is_boosted: false, // Viral Spike se aplikuje explicitně
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    post: {
      ...post,
      authorName: avatar?.display_name || 'Neznámý',
    },
  })
}
