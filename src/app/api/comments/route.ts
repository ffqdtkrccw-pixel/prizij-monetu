import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get('post_id')

  if (!postId) {
    return NextResponse.json({ error: 'Chybí post_id' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comments')
    .select(`
      id, post_id, parent_id, avatar_id, depth, content, created_at,
      avatars!inner(display_name)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const transformovane = (data || []).map(c => ({
    id: c.id,
    postId: c.post_id,
    parentId: c.parent_id,
    avatarId: c.avatar_id,
    authorName: (c.avatars as unknown as { display_name: string })?.display_name || 'Neznámý',
    depth: c.depth,
    content: c.content,
    createdAt: c.created_at,
  }))

  return NextResponse.json({ comments: transformovane })
}

export async function POST(req: NextRequest) {
  const avatarId = req.headers.get('X-Avatar-Id')
  if (!avatarId) {
    return NextResponse.json({ error: 'Chybí X-Avatar-Id' }, { status: 401 })
  }

  const body = await req.json()
  const { post_id, parent_id, content } = body

  if (!post_id || !content?.trim()) {
    return NextResponse.json({ error: 'Chybí post_id nebo obsah' }, { status: 400 })
  }

  if (content.trim().length > 280) {
    return NextResponse.json({ error: 'Komentář je příliš dlouhý (max 280 znaků)' }, { status: 400 })
  }

  const supabase = getSupabaseServiceClient()

  let depth = 0
  if (parent_id) {
    const { data: parent } = await supabase
      .from('comments')
      .select('depth')
      .eq('id', parent_id)
      .single()

    if (!parent) {
      return NextResponse.json({ error: 'Rodičovský komentář nenalezen' }, { status: 404 })
    }

    depth = parent.depth + 1
    if (depth > 1) {
      return NextResponse.json({ error: 'Maximální hloubka komentářů je 2' }, { status: 400 })
    }
  }

  const { data: avatar } = await supabase
    .from('avatars')
    .select('display_name')
    .eq('id', avatarId)
    .single()

  const { data: komentar, error } = await supabase
    .from('comments')
    .insert({
      post_id,
      parent_id: parent_id || null,
      avatar_id: avatarId,
      depth,
      content: content.trim(),
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    comment: {
      ...komentar,
      authorName: avatar?.display_name || 'Neznámý',
    },
  })
}
