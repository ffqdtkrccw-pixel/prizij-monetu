'use client'

import { useState } from 'react'
import { ReakceTyp } from '@/types/feed'
import { REAKCE_VAHY, LS_AVATAR_ID } from '@/lib/constants'
import { useFeedStore } from '@/store/feedStore'

interface ReactionBarProps {
  postId: string
  reactionScore: number
  mojeReakce: ReakceTyp[]
}

const REAKCE_CONFIG: { type: ReakceTyp; emoji: string; popis: string }[] = [
  { type: 'skull',  emoji: '💀', popis: 'Fatální' },
  { type: 'fire',   emoji: '🔥', popis: 'Hořelo' },
  { type: 'chart',  emoji: '📉', popis: 'Pokles' },
  { type: 'clown',  emoji: '🤡', popis: 'Cirkus' },
]

export function ReactionBar({ postId, reactionScore, mojeReakce }: ReactionBarProps) {
  const updatePost = useFeedStore(s => s.updatePost)
  const [pendingReakce, setPendingReakce] = useState<ReakceTyp | null>(null)

  const handleReakce = async (type: ReakceTyp) => {
    const avatarId = localStorage.getItem(LS_AVATAR_ID)
    if (!avatarId || pendingReakce) return

    setPendingReakce(type)

    // Optimistická aktualizace
    const weight = REAKCE_VAHY[type]
    const isRemoval = mojeReakce.includes(type)

    updatePost(postId, {
      reactionScore: isRemoval
        ? Math.max(0, reactionScore - weight)
        : reactionScore + weight,
      moje_reakce: isRemoval
        ? mojeReakce.filter(r => r !== type)
        : [...mojeReakce, type],
    })

    try {
      await fetch(`/api/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Avatar-Id': avatarId,
        },
        body: JSON.stringify({ reaction_type: type }),
      })
    } catch {
      // Revert při chybě
      updatePost(postId, {
        reactionScore,
        moje_reakce: mojeReakce,
      })
    } finally {
      setPendingReakce(null)
    }
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {REAKCE_CONFIG.map(r => {
        const isActive = mojeReakce.includes(r.type)
        const isPending = pendingReakce === r.type

        return (
          <button
            key={r.type}
            onClick={() => handleReakce(r.type)}
            disabled={!!pendingReakce}
            title={r.popis}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono border transition-all duration-150
              ${isActive
                ? 'border-cyan-600/60 bg-cyan-950/30 text-cyan-300'
                : 'border-gray-800 text-gray-600 hover:border-gray-600 hover:text-gray-400'
              }
              ${isPending ? 'animate-pulse' : ''}
              disabled:cursor-default`}
          >
            <span>{r.emoji}</span>
          </button>
        )
      })}

      {reactionScore > 0 && (
        <span className="text-xs text-gray-600 font-mono ml-1">
          {reactionScore} pts
        </span>
      )}
    </div>
  )
}
