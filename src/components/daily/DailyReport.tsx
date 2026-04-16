'use client'

import { useEffect, useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import { MonospaceCard } from '@/components/ui/MonospaceCard'
import { CyberButton } from '@/components/ui/CyberButton'

export function DailyReport() {
  const { isDailyReportVisible, lastDailyReport, hideDailyReport } = useUIStore()
  const [animatedDamage, setAnimatedDamage] = useState(0)

  useEffect(() => {
    if (!isDailyReportVisible || !lastDailyReport) return
    setAnimatedDamage(0)
    const target = lastDailyReport.damage
    const step = Math.ceil(target / 20)
    const interval = setInterval(() => {
      setAnimatedDamage(prev => {
        const next = prev + step
        if (next >= target) {
          clearInterval(interval)
          return target
        }
        return next
      })
    }, 50)
    return () => clearInterval(interval)
  }, [isDailyReportVisible, lastDailyReport])

  if (!isDailyReportVisible || !lastDailyReport) return null

  const { xpGained } = lastDailyReport

  return (
    <MonospaceCard glow="green" className="p-4">
      <div className="space-y-4">
        {/* Nadpis */}
        <div className="text-center">
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">
            Check-in výsledek
          </div>
          <div className="text-green-400 font-mono font-bold text-sm">
            ✓ Výkaz odeslán — poškození Vzpurného zaznamenáno
          </div>
        </div>

        {/* Damage counter */}
        <div className="text-center">
          <div className="text-4xl font-mono font-black text-red-400 tabular-nums">
            -{animatedDamage}
          </div>
          <div className="text-xs text-gray-600 font-mono">damage dealt to Vzpurný</div>
        </div>

        {/* XP */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-gray-500 font-mono">XP gained:</span>
          <span className="text-purple-400 font-mono font-bold">+{xpGained} XP</span>
        </div>

        {/* Motivační zpráva */}
        <div className="text-xs text-gray-600 font-mono text-center italic border border-gray-800 rounded px-3 py-2">
          &bdquo;Každý výkaz je tichý akt odporu. Dnes ses zúčastnil(a) boje.&ldquo;
        </div>

        <CyberButton variant="ghost" size="sm" onClick={hideDailyReport} className="w-full">
          Zavřít
        </CyberButton>
      </div>
    </MonospaceCard>
  )
}
