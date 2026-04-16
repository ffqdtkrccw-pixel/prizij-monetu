'use client'

import { useAvatarStore } from '@/store/avatarStore'
import { useUIStore } from '@/store/uiStore'
import { MonospaceCard } from '@/components/ui/MonospaceCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CyberButton } from '@/components/ui/CyberButton'
import { StatBar } from './StatBar'
import { levelZXP } from '@/lib/game/xp'
import { BackupKeyModal } from './BackupKeyModal'
import { AbilityList } from './AbilityList'

export function AvatarPanel() {
  const avatar = useAvatarStore(s => s.avatar)
  const openBackupKeyModal = useUIStore(s => s.openBackupKeyModal)

  if (!avatar) {
    return (
      <MonospaceCard glow="cyan" className="p-4">
        <div className="text-gray-500 font-mono text-sm animate-pulse">
          Inicializuji identitu...
        </div>
      </MonospaceCard>
    )
  }

  const { progress } = levelZXP(avatar.xp)
  const isBurnoutCritical = avatar.stats.burnout > 70
  const isMoraleLow = avatar.stats.morale < 30

  return (
    <>
      <MonospaceCard glow="cyan" className="p-4 space-y-4">
        {/* Hlavička avatara */}
        <div className="flex items-start justify-between">
          <div>
            <div className={`font-mono font-bold text-sm ${
              isBurnoutCritical ? 'text-red-400 glitch-medium' :
              isMoraleLow ? 'text-gray-500' : 'text-cyan-300'
            }`}>
              {isBurnoutCritical && <span className="mr-1 animate-pulse">⚠</span>}
              {avatar.displayName}
            </div>
            <div className="text-xs text-gray-600 font-mono mt-0.5">
              anonymní zaměstnanec #{avatar.id.slice(0, 8)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-purple-400 font-mono font-bold">
              LVL {avatar.level}
            </div>
            <div className="text-xs text-gray-600 font-mono">
              {avatar.xp.toLocaleString('cs')} XP
            </div>
          </div>
        </div>

        {/* XP progress */}
        <div>
          <ProgressBar
            value={progress}
            variant="xp"
            label={`do LVL ${avatar.level + 1}`}
            showValue={false}
          />
        </div>

        {/* Staty */}
        <div className="space-y-2.5">
          <StatBar nazev="Morálka"  hodnota={avatar.stats.morale}  varianta="morale"  ikona="🧠" />
          <StatBar nazev="Energie"  hodnota={avatar.stats.energy}  varianta="energy"  ikona="⚡" />
          <StatBar nazev="Vyhoření" hodnota={avatar.stats.burnout} varianta="burnout" ikona="🔥" />
        </div>

        {/* Vedlejší staty */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="text-center">
            <div className="text-xs text-gray-500 font-mono uppercase">Flex</div>
            <div className="text-sm font-mono font-bold text-green-400">{avatar.stats.flex}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 font-mono uppercase">Přesčas</div>
            <div className="text-sm font-mono font-bold text-yellow-400">{avatar.stats.overtimeMins}m</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 font-mono uppercase">Influence</div>
            <div className="text-sm font-mono font-bold text-purple-400">{avatar.influenceScore}</div>
          </div>
        </div>

        {/* Status zpráva */}
        {isBurnoutCritical && (
          <div className="text-xs text-red-400/80 font-mono border border-red-900/50 rounded px-2 py-1.5 bg-red-950/20">
            ⚠ KRITICKÝ BURNOUT — výkonnost degradována. Vzpurný je spokojený.
          </div>
        )}
        {isMoraleLow && !isBurnoutCritical && (
          <div className="text-xs text-gray-500 font-mono border border-gray-800 rounded px-2 py-1.5">
            Morálka nízká. Avatar se pohybuje jako zombie v open space.
          </div>
        )}

        {/* Schopnosti */}
        {avatar.unlockedAbilities.length > 0 && (
          <AbilityList abilities={avatar.unlockedAbilities} />
        )}

        {/* Backup klíč */}
        <div className="pt-1 border-t border-gray-800/50">
          <CyberButton
            variant="ghost"
            size="sm"
            onClick={openBackupKeyModal}
            className="w-full text-xs text-gray-600 hover:text-gray-400"
          >
            🔑 zálohovací klíč
          </CyberButton>
        </div>
      </MonospaceCard>

      <BackupKeyModal />
    </>
  )
}
