'use client'

import { useEffect, useState } from 'react'

interface StatDeltaProps {
  value: number
  suffix?: string
}

export function StatDelta({ value, suffix = '' }: StatDeltaProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(timer)
  }, [value])

  if (!visible || value === 0) return null

  const isPositive = value > 0
  const color = isPositive ? 'text-green-400' : 'text-red-400'
  const sign = isPositive ? '+' : ''

  return (
    <span className={`text-xs font-mono font-bold animate-bounce ${color}`}>
      {sign}{value}{suffix}
    </span>
  )
}
