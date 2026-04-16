'use client'

import { useState } from 'react'
import { Komentar } from '@/types/feed'
import { CyberButton } from '@/components/ui/CyberButton'
import { LS_AVATAR_ID } from '@/lib/constants'

interface CommentSectionProps {
  postId: string
  commentCount: number
}

interface CommentCardProps {
  comment: Komentar
  postId: string
  onReply: (parentId: string) => void
  replyTo: string | null
}

function CommentCard({ comment, postId, onReply, replyTo }: CommentCardProps) {
  const [replyText, setReplyText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleReply = async () => {
    const avatarId = localStorage.getItem(LS_AVATAR_ID)
    if (!avatarId || !replyText.trim()) return
    setIsLoading(true)
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Avatar-Id': avatarId,
        },
        body: JSON.stringify({
          post_id: postId,
          parent_id: comment.id,
          content: replyText.trim(),
        }),
      })
      setReplyText('')
      onReply('')
    } finally {
      setIsLoading(false)
    }
  }

  const casOd = new Date(comment.createdAt).toLocaleTimeString('cs', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`${comment.depth > 0 ? 'ml-4 border-l border-gray-800 pl-3' : ''}`}>
      <div className="flex items-start gap-2 py-1.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-mono text-cyan-400/70 truncate">{comment.authorName}</span>
            <span className="text-[10px] text-gray-700 font-mono">{casOd}</span>
          </div>
          <p className="text-xs text-gray-300 font-mono leading-relaxed break-words">
            {comment.content}
          </p>
        </div>
        {comment.depth === 0 && (
          <button
            onClick={() => onReply(replyTo === comment.id ? '' : comment.id)}
            className="text-[10px] text-gray-700 hover:text-gray-500 font-mono shrink-0"
          >
            reply
          </button>
        )}
      </div>

      {replyTo === comment.id && (
        <div className="ml-2 mb-2 flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Odpovědět..."
            maxLength={280}
            className="flex-1 bg-black border border-gray-800 rounded px-2 py-1 text-xs font-mono text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-gray-600"
          />
          <CyberButton size="sm" variant="outline" onClick={handleReply} loading={isLoading}>
            →
          </CyberButton>
        </div>
      )}
    </div>
  )
}

export function CommentSection({ postId, commentCount }: CommentSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [comments, setComments] = useState<Komentar[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [replyTo, setReplyTo] = useState<string>('')
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadComments = async () => {
    if (isOpen) { setIsOpen(false); return }
    setIsOpen(true)
    setIsLoading(true)
    try {
      const res = await fetch(`/api/comments?post_id=${postId}`)
      const data = await res.json()
      setComments(data.comments || [])
    } finally {
      setIsLoading(false)
    }
  }

  const submitComment = async () => {
    const avatarId = localStorage.getItem(LS_AVATAR_ID)
    if (!avatarId || !newComment.trim()) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Avatar-Id': avatarId },
        body: JSON.stringify({ post_id: postId, content: newComment.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setComments(prev => [...prev, { ...data.comment, replies: [] }])
        setNewComment('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Struktura: top-level komentáře s replies
  const topLevel = comments.filter(c => !c.parentId)
  const replies = comments.filter(c => c.parentId)

  return (
    <div>
      <button
        onClick={loadComments}
        className="text-[11px] text-gray-600 hover:text-gray-400 font-mono transition-colors"
      >
        💬 {commentCount > 0 ? `${commentCount} komentářů` : 'Komentovat'} {isOpen ? '▲' : '▼'}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-1">
          {isLoading && (
            <div className="text-xs text-gray-700 font-mono animate-pulse">Načítám...</div>
          )}

          {topLevel.map(c => (
            <div key={c.id}>
              <CommentCard
                comment={c}
                postId={postId}
                onReply={setReplyTo}
                replyTo={replyTo}
              />
              {replies.filter(r => r.parentId === c.id).map(reply => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onReply={() => {}}
                  replyTo={null}
                />
              ))}
            </div>
          ))}

          {/* Nový komentář */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Přidat komentář..."
              maxLength={280}
              className="flex-1 bg-black border border-gray-800 rounded px-2 py-1 text-xs font-mono text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-gray-600"
            />
            <CyberButton size="sm" variant="outline" onClick={submitComment} loading={isSubmitting}>
              →
            </CyberButton>
          </div>
        </div>
      )}
    </div>
  )
}
