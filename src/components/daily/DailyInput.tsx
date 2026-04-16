'use client'

import { useState } from 'react'
import { useAvatarStore } from '@/store/avatarStore'
import { useUIStore } from '@/store/uiStore'
import { MonospaceCard } from '@/components/ui/MonospaceCard'
import { CyberButton } from '@/components/ui/CyberButton'
import { DayRatingPicker } from './DayRatingPicker'
import { HodnoceniDne } from '@/types/avatar'
import { LS_AVATAR_ID } from '@/lib/constants'

export function DailyInput() {
  const avatar = useAvatarStore(s => s.avatar)
  const { updateStats, setCheckinDone, addXP } = useAvatarStore()
  const { showDailyReport, setCheckinInProgress } = useUIStore()

  const [officeDays, setOfficeDays] = useState(2)
  const [hoDays, setHoDays] = useState(3)
  const [overtime, setOvertime] = useState(0)
  const [rating, setRating] = useState<HodnoceniDne | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!avatar) return null

  if (avatar.hasDoneCheckinToday) {
    return (
      <MonospaceCard glow="green" className="p-4">
        <div className="text-center space-y-2">
          <div className="text-green-400 font-mono text-sm font-bold">✓ Check-in dokončen</div>
          <div className="text-xs text-gray-600 font-mono">
            Tvůj příspěvek k dnešnímu boji byl zaznamenán. Bojuj dál na feedy.
          </div>
        </div>
      </MonospaceCard>
    )
  }

  const handleSubmit = async () => {
    if (!rating) {
      setError('Vyber hodnocení dne')
      return
    }

    const avatarId = localStorage.getItem(LS_AVATAR_ID)
    if (!avatarId) return

    setIsLoading(true)
    setError('')
    setCheckinInProgress(true)

    try {
      const res = await fetch('/api/daily-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Avatar-Id': avatarId,
        },
        body: JSON.stringify({
          office_days: officeDays,
          home_office_days: hoDays,
          overtime_mins: overtime,
          day_rating: rating,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Chyba check-inu')
        return
      }

      const data = await res.json()

      // Optimistická aktualizace stavu
      updateStats(data.delta)
      addXP(data.xpGained)
      setCheckinDone()

      showDailyReport({
        result: 'win',      // Dočasný default — reálný výsledek přijde večer
        damage: data.damageContrib,
        control: 0,
        xpGained: data.xpGained,
        bossHpBefore: 100,
        bossHpAfter: 100,
      })
    } catch {
      setError('Síťová chyba. Zkus to znovu.')
    } finally {
      setIsLoading(false)
      setCheckinInProgress(false)
    }
  }

  return (
    <MonospaceCard glow="cyan" title="Denní výkaz práce™" className="p-4">
      <div className="space-y-4 pt-2">

        {/* Kancelář vs HO */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-1">
              🏢 V kanceláři (dny)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOfficeDays(Math.max(0, officeDays - 1))}
                className="w-7 h-7 rounded border border-gray-700 text-gray-400 hover:border-gray-500 font-mono text-sm"
              >−</button>
              <span className="text-sm font-mono font-bold text-cyan-300 w-4 text-center tabular-nums">
                {officeDays}
              </span>
              <button
                onClick={() => setOfficeDays(Math.min(5, officeDays + 1))}
                className="w-7 h-7 rounded border border-gray-700 text-gray-400 hover:border-gray-500 font-mono text-sm"
              >+</button>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-1">
              🏠 Home office (dny)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHoDays(Math.max(0, hoDays - 1))}
                className="w-7 h-7 rounded border border-gray-700 text-gray-400 hover:border-gray-500 font-mono text-sm"
              >−</button>
              <span className="text-sm font-mono font-bold text-cyan-300 w-4 text-center tabular-nums">
                {hoDays}
              </span>
              <button
                onClick={() => setHoDays(Math.min(5, hoDays + 1))}
                className="w-7 h-7 rounded border border-gray-700 text-gray-400 hover:border-gray-500 font-mono text-sm"
              >+</button>
            </div>
          </div>
        </div>

        {/* Přesčas */}
        <div>
          <label className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-1">
            ⏰ Přesčas (minuty)
          </label>
          <div className="flex items-center gap-3">
            {[0, 30, 60, 90, 120].map(min => (
              <button
                key={min}
                onClick={() => setOvertime(min)}
                className={`px-2 py-1 text-xs font-mono rounded border transition-all ${
                  overtime === min
                    ? 'border-orange-600 text-orange-300 bg-orange-950/30'
                    : 'border-gray-800 text-gray-600 hover:border-gray-600'
                }`}
              >
                {min === 0 ? '0' : `+${min}`}
              </button>
            ))}
          </div>
        </div>

        {/* Hodnocení dne */}
        <DayRatingPicker value={rating} onChange={setRating} />

        {/* Chyba */}
        {error && (
          <div className="text-xs text-red-400 font-mono">{error}</div>
        )}

        {/* Submit */}
        <CyberButton
          variant="primary"
          size="md"
          onClick={handleSubmit}
          loading={isLoading}
          disabled={!rating}
          className="w-full"
        >
          Odeslat výkaz → deal damage
        </CyberButton>

        <div className="text-[10px] text-gray-700 font-mono text-center">
          Anonymní. Žádné osobní údaje. Vzpurný neví, kdo jsi.
        </div>
      </div>
    </MonospaceCard>
  )
}
