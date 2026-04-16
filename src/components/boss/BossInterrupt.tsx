'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'
import { GlitchText } from '@/components/ui/GlitchText'
import { CyberButton } from '@/components/ui/CyberButton'

export function BossInterrupt() {
  const { isBossInterruptActive, bossInterruptEvent, dismissInterrupt } = useUIStore()

  useEffect(() => {
    if (!isBossInterruptActive) return
    // Auto-dismiss po 10 sekundách
    const timer = setTimeout(dismissInterrupt, 10000)
    return () => clearTimeout(timer)
  }, [isBossInterruptActive, dismissInterrupt])

  // ESC pro zavření
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isBossInterruptActive) dismissInterrupt()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isBossInterruptActive, dismissInterrupt])

  if (!isBossInterruptActive || !bossInterruptEvent) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center boss-interrupt-overlay"
      onClick={dismissInterrupt}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanline-overlay pointer-events-none" />

      {/* Červený pulzující border */}
      <div className="absolute inset-0 border-4 border-red-500 animate-pulse pointer-events-none" />

      {/* Obsah */}
      <div
        className="relative max-w-lg w-full mx-4 bg-black border-2 border-red-600 rounded p-8 space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Hlavička */}
        <div className="text-center space-y-2">
          <div className="text-xs font-mono text-red-600 tracking-[0.4em] uppercase animate-pulse">
            ▓▓▓ SYSTEM MESSAGE ▓▓▓
          </div>
          <GlitchText
            as="h1"
            intensity="high"
            className="text-red-500 font-bold text-2xl font-mono uppercase tracking-wider block"
          >
            VZPURNÝ
          </GlitchText>
          <div className="text-xs text-red-800 font-mono">
            Senior VP of Control & Alignment — NOVÁ DIREKTIVA
          </div>
        </div>

        {/* Událost */}
        <div className="border border-red-900/60 rounded bg-red-950/20 p-4 space-y-2">
          <div className="text-red-300 font-mono font-bold text-lg">
            {bossInterruptEvent.title}
          </div>
          <p className="text-gray-300 font-mono text-sm leading-relaxed">
            {bossInterruptEvent.description}
          </p>
        </div>

        {/* Dopad */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          {bossInterruptEvent.moraleDelta !== 0 && (
            <div className="text-red-400">
              🧠 Morálka: {bossInterruptEvent.moraleDelta > 0 ? '+' : ''}{bossInterruptEvent.moraleDelta}
            </div>
          )}
          {bossInterruptEvent.burnoutDelta !== 0 && (
            <div className="text-red-400">
              🔥 Vyhoření: {bossInterruptEvent.burnoutDelta > 0 ? '+' : ''}{bossInterruptEvent.burnoutDelta}
            </div>
          )}
          {bossInterruptEvent.energyDelta !== 0 && (
            <div className="text-red-400">
              ⚡ Energie: {bossInterruptEvent.energyDelta > 0 ? '+' : ''}{bossInterruptEvent.energyDelta}
            </div>
          )}
          {bossInterruptEvent.overtimeDelta !== 0 && (
            <div className="text-red-400">
              ⏰ Přesčas: +{bossInterruptEvent.overtimeDelta}m
            </div>
          )}
        </div>

        {/* Dismiss */}
        <div className="flex items-center justify-between">
          <CyberButton variant="danger" size="sm" onClick={dismissInterrupt}>
            [ACKNOWLEDGED]
          </CyberButton>
          <span className="text-xs text-gray-700 font-mono">
            ESC nebo kliknutí mimo
          </span>
        </div>
      </div>
    </div>
  )
}
