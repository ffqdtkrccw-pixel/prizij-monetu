import { BossEvent } from '@/types/game'

interface BossEventCardProps {
  event: BossEvent
}

const kategorieBadge: Record<string, string> = {
  realisticky: 'text-orange-400 border-orange-900/50',
  bizarni:     'text-yellow-400 border-yellow-900/50',
}

export function BossEventCard({ event }: BossEventCardProps) {
  const dopad = [
    event.moraleDelta !== 0 && `morálka ${event.moraleDelta > 0 ? '+' : ''}${event.moraleDelta}`,
    event.burnoutDelta !== 0 && `vyhoření ${event.burnoutDelta > 0 ? '+' : ''}${event.burnoutDelta}`,
    event.energyDelta !== 0 && `energie ${event.energyDelta > 0 ? '+' : ''}${event.energyDelta}`,
    event.overtimeDelta !== 0 && `přesčas +${event.overtimeDelta}m`,
  ].filter(Boolean).join(' | ')

  return (
    <div className="border border-red-900/30 rounded bg-red-950/10 px-3 py-2 space-y-1">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-mono font-bold text-red-300 leading-tight">
          {event.title}
        </span>
        <span className={`text-[10px] font-mono border rounded px-1 shrink-0 ${kategorieBadge[event.category] || 'text-gray-500'}`}>
          {event.category === 'realisticky' ? 'reál' : 'bizarní'}
        </span>
      </div>
      <p className="text-[11px] text-gray-500 font-mono leading-relaxed">
        {event.description}
      </p>
      {dopad && (
        <div className="text-[10px] text-red-500/70 font-mono">
          ▸ {dopad}
        </div>
      )}
    </div>
  )
}
