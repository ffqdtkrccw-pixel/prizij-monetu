'use client'

import { useState } from 'react'
import { useFeedStore } from '@/store/feedStore'
import { useAvatarStore } from '@/store/avatarStore'
import { CyberButton } from '@/components/ui/CyberButton'
import { MAX_DELKA_POSTU, LS_AVATAR_ID } from '@/lib/constants'

export function PostComposer() {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const prependPost = useFeedStore(s => s.prependPost)
  const avatar = useAvatarStore(s => s.avatar)

  const zbyvaznaků = MAX_DELKA_POSTU - text.length
  const isOver = zbyvaznaků < 0

  const handleSubmit = async () => {
    const avatarId = localStorage.getItem(LS_AVATAR_ID)
    if (!avatarId || !text.trim() || isOver) return

    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Avatar-Id': avatarId,
        },
        body: JSON.stringify({ content: text.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Chyba při odesílání')
        return
      }

      // Přidej post do feedu okamžitě (realtime ho přidá znovu — deduplicate v produkci)
      prependPost({
        id: data.post.id,
        avatarId: avatarId,
        authorName: avatar?.displayName || 'Já',
        seasonId: data.post.season_id || '',
        content: data.post.content,
        reactionScore: 0,
        commentCount: 0,
        isBoosted: false,
        createdAt: data.post.created_at || new Date().toISOString(),
        reactions: [],
        moje_reakce: [],
      })

      setText('')
    } catch {
      setError('Síťová chyba')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  return (
    <div className="bg-[#0a0a14] border border-gray-800/50 rounded-sm p-3 space-y-2">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Co se dnes děje? Ventiluj, bojuj, přežij... (Ctrl+Enter pro odeslání)"
        rows={3}
        className="w-full bg-transparent text-sm font-mono text-gray-200 placeholder:text-gray-700 resize-none focus:outline-none leading-relaxed"
        maxLength={MAX_DELKA_POSTU + 50} // Mírně nad limit pro vizuální feedback
      />
      <div className="flex items-center justify-between">
        <div className={`text-[10px] font-mono tabular-nums ${
          isOver ? 'text-red-500' : zbyvaznaků < 50 ? 'text-yellow-500' : 'text-gray-700'
        }`}>
          {zbyvaznaků} znaků zbývá
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-400 font-mono">{error}</span>}
          <CyberButton
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!text.trim() || isOver}
          >
            Odeslat
          </CyberButton>
        </div>
      </div>
    </div>
  )
}
