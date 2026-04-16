import { BossEvent } from '@/types/game'
import { BossEventCard } from './BossEventCard'

interface EventListProps {
  events: BossEvent[]
}

export function EventList({ events }: EventListProps) {
  return (
    <div className="space-y-2">
      {events.map(event => (
        <BossEventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
