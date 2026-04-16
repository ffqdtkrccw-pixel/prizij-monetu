'use client'

import { useState } from 'react'
import { useAvatarStore } from '@/store/avatarStore'
import { useUIStore } from '@/store/uiStore'
import { CyberButton } from '@/components/ui/CyberButton'
import { levelZXP } from '@/lib/game/xp'
import { LS_AVATAR_ID, LS_AVATAR_NAME, LS_BACKUP_KEY } from '@/lib/constants'

export function BackupKeyModal() {
  const isOpen = useUIStore(s => s.isBackupKeyModalOpen)
  const closeModal = useUIStore(s => s.closeBackupKeyModal)
  const { avatar, setAvatar } = useAvatarStore()
  const [mode, setMode] = useState<'view' | 'restore'>('view')
  const [restoreKey, setRestoreKey] = useState('')
  const [restoreError, setRestoreError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const copyKey = async () => {
    if (!avatar?.backupKey) return
    await navigator.clipboard.writeText(avatar.backupKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRestore = async () => {
    if (!restoreKey.trim()) return
    setIsLoading(true)
    setRestoreError('')

    try {
      const res = await fetch('/api/avatar/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup_key: restoreKey.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setRestoreError(data.error || 'Chyba obnovy')
        return
      }

      const data = await res.json()
      const { level, xpToNext } = levelZXP(data.xp)

      // Ulož novou identitu do localStorage
      localStorage.setItem(LS_AVATAR_ID, data.id)
      localStorage.setItem(LS_AVATAR_NAME, data.display_name)
      localStorage.setItem(LS_BACKUP_KEY, restoreKey.trim())

      setAvatar({
        id: data.id,
        displayName: data.display_name,
        level,
        xp: data.xp,
        xpToNext,
        stats: {
          morale: data.morale,
          energy: data.energy,
          burnout: data.burnout,
          flex: data.flex,
          overtimeMins: data.overtime_mins,
          loyalty: data.loyalty,
        },
        influenceScore: data.influence_score,
        unlockedAbilities: data.unlocked_abilities || [],
        hasDoneCheckinToday: false,
        lastCheckinDate: null,
        backupKey: restoreKey.trim(),
        createdAt: data.created_at,
      })

      closeModal()
    } catch {
      setRestoreError('Síťová chyba. Zkus to znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={closeModal}
    >
      <div
        className="bg-[#0a0a14] border border-cyan-900/50 rounded p-6 max-w-sm w-full space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <h2 className="font-mono text-cyan-300 text-sm uppercase tracking-widest">
            🔑 Zálohovací klíč
          </h2>
          <button onClick={closeModal} className="text-gray-600 hover:text-gray-400 font-mono text-xs">
            [zavřít]
          </button>
        </div>

        <div className="flex gap-2 border-b border-gray-800 pb-2">
          <button
            onClick={() => setMode('view')}
            className={`text-xs font-mono px-2 py-1 rounded ${mode === 'view' ? 'text-cyan-300 bg-cyan-900/20' : 'text-gray-500'}`}
          >
            Zobrazit klíč
          </button>
          <button
            onClick={() => setMode('restore')}
            className={`text-xs font-mono px-2 py-1 rounded ${mode === 'restore' ? 'text-cyan-300 bg-cyan-900/20' : 'text-gray-500'}`}
          >
            Obnovit identitu
          </button>
        </div>

        {mode === 'view' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 font-mono leading-relaxed">
              Tento klíč ti umožní obnovit identitu na jiném zařízení. Nikde ho neukládáme —
              existuje pouze tady. Neukazuj ho nikomu.
            </p>
            <div className="bg-black border border-gray-800 rounded px-3 py-2 font-mono text-sm text-green-400 tracking-widest text-center">
              {avatar?.backupKey || '—'}
            </div>
            <CyberButton variant="outline" size="sm" onClick={copyKey} className="w-full">
              {copied ? '✓ Zkopírováno' : 'Kopírovat klíč'}
            </CyberButton>
            <p className="text-xs text-gray-700 font-mono">
              * Žádné osobní údaje. Anonymita garantována.
            </p>
          </div>
        )}

        {mode === 'restore' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 font-mono leading-relaxed">
              Zadej svůj zálohovací klíč z jiného zařízení. Tvoje aktuální identita bude nahrazena.
            </p>
            <input
              type="text"
              value={restoreKey}
              onChange={e => setRestoreKey(e.target.value.toUpperCase())}
              placeholder="XXXXXXXXXXXXXXXXXX"
              className="w-full bg-black border border-gray-700 rounded px-3 py-2 font-mono text-sm text-green-400 tracking-widest placeholder:text-gray-700 focus:outline-none focus:border-cyan-700"
              maxLength={20}
            />
            {restoreError && (
              <p className="text-xs text-red-400 font-mono">{restoreError}</p>
            )}
            <CyberButton
              variant="primary"
              size="sm"
              onClick={handleRestore}
              loading={isLoading}
              disabled={restoreKey.length < 10}
              className="w-full"
            >
              Obnovit identitu
            </CyberButton>
          </div>
        )}
      </div>
    </div>
  )
}
