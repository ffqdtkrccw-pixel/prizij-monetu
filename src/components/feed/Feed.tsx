'use client'

import { useEffect, useCallback } from 'react'
import { useFeedStore } from '@/store/feedStore'
import { useAvatarStore } from '@/store/avatarStore'
import { PostCard } from './PostCard'
import { PostComposer } from './PostComposer'
import { CyberButton } from '@/components/ui/CyberButton'
import { LS_AVATAR_ID } from '@/lib/constants'

export function Feed() {
  const { posts, isLoading, hasMore, cursor, setPosts, appendPosts, setLoading } = useFeedStore()
  useAvatarStore(s => s.avatar)
  const myAvatarId = typeof window !== 'undefined' ? localStorage.getItem(LS_AVATAR_ID) || undefined : undefined

  const fetchPosts = useCallback(async (append = false) => {
    setLoading(true)
    try {
      const url = append && cursor
        ? `/api/posts?cursor=${encodeURIComponent(cursor)}`
        : '/api/posts'
      const res = await fetch(url)
      const data = await res.json()
      if (append) {
        appendPosts(data.posts || [], data.cursor)
      } else {
        setPosts(data.posts || [])
      }
    } finally {
      setLoading(false)
    }
  }, [cursor, setPosts, appendPosts, setLoading])

  useEffect(() => {
    fetchPosts(false)
  }, []) // eslint-disable-line

  return (
    <div className="space-y-3">
      {/* Composer */}
      <PostComposer />

      {/* Posts */}
      <div className="space-y-2">
        {posts.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-700 font-mono text-sm">
            <div className="text-2xl mb-2">📭</div>
            Zatím žádné zprávy z fronty.
            <br />
            <span className="text-xs">Buď první, kdo zkompromituje systém.</span>
          </div>
        )}

        {posts.map(post => (
          <PostCard key={post.id} post={post} myAvatarId={myAvatarId} />
        ))}

        {isLoading && (
          <div className="text-center py-4 text-gray-700 font-mono text-xs animate-pulse">
            Načítám přenosy ze sítě odporu...
          </div>
        )}

        {!isLoading && hasMore && posts.length > 0 && (
          <div className="text-center pt-2">
            <CyberButton variant="ghost" size="sm" onClick={() => fetchPosts(true)}>
              Načíst starší
            </CyberButton>
          </div>
        )}
      </div>
    </div>
  )
}
