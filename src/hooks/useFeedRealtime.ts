'use client'

import { useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useFeedStore } from '@/store/feedStore'
import { Post } from '@/types/feed'

export function useFeedRealtime(seasonId: string | undefined) {
  const { prependPost, updatePost } = useFeedStore()

  useEffect(() => {
    if (!seasonId) return
    const supabase = getSupabaseClient()

    // Nové posty
    const postChannel = supabase
      .channel(`feed_posts_${seasonId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `season_id=eq.${seasonId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (payload: any) => {
          const row = payload.new

          // Načti jméno autora
          const { data: avatarData } = await supabase
            .from('avatars')
            .select('display_name')
            .eq('id', String(row.avatar_id))
            .single()

          const post: Post = {
            id: String(row.id),
            avatarId: String(row.avatar_id),
            authorName: avatarData?.display_name || 'Neznámý zaměstnanec',
            seasonId: String(row.season_id),
            content: String(row.content),
            reactionScore: 0,
            commentCount: 0,
            isBoosted: Boolean(row.is_boosted),
            createdAt: String(row.created_at),
            reactions: [],
            moje_reakce: [],
          }
          prependPost(post)
        }
      )
      .subscribe()

    // Aktualizace skóre na postech
    const scoreChannel = supabase
      .channel(`feed_scores_${seasonId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `season_id=eq.${seasonId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const row = payload.new
          updatePost(String(row.id), {
            reactionScore: Number(row.reaction_score),
            commentCount: Number(row.comment_count),
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(postChannel)
      supabase.removeChannel(scoreChannel)
    }
  }, [seasonId, prependPost, updatePost])
}
