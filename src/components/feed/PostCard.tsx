'use client'

import { Post } from '@/types/feed'
import { ReactionBar } from './ReactionBar'
import { CommentSection } from './CommentSection'

interface PostCardProps {
  post: Post
  myAvatarId?: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'právě teď'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export function PostCard({ post, myAvatarId }: PostCardProps) {
  const isOwnPost = myAvatarId && post.avatarId === myAvatarId
  const isBoosted = post.isBoosted

  return (
    <div className={`bg-[#0a0a14] border rounded-sm px-3 py-3 space-y-2 transition-all duration-200 ${
      isBoosted
        ? 'border-yellow-800/50 shadow-[0_0_8px_rgba(234,179,8,0.1)]'
        : isOwnPost
          ? 'border-cyan-900/40'
          : 'border-gray-800/50 hover:border-gray-700/50'
    }`}>
      {/* Hlavička */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isBoosted && <span className="text-yellow-400 text-[10px]">⚡</span>}
          <span className={`text-xs font-mono truncate ${
            isOwnPost ? 'text-cyan-400' : 'text-gray-500'
          }`}>
            {post.authorName}
          </span>
        </div>
        <span className="text-[10px] text-gray-700 font-mono shrink-0">
          {timeAgo(post.createdAt)}
        </span>
      </div>

      {/* Obsah */}
      <p className="text-sm text-gray-200 font-mono leading-relaxed break-words">
        {post.content}
      </p>

      {/* Akce */}
      <div className="flex items-center justify-between pt-1">
        <ReactionBar
          postId={post.id}
          reactionScore={post.reactionScore}
          mojeReakce={post.moje_reakce || []}
        />
        <CommentSection
          postId={post.id}
          commentCount={post.commentCount}
        />
      </div>
    </div>
  )
}
