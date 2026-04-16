'use client'

import { useEffect } from 'react'
import { useAvatarStore } from '@/store/avatarStore'
import { generujUUID, generujJmeno, generujBackupKey } from '@/lib/game/avatar'
import { levelZXP } from '@/lib/game/xp'
import { LS_AVATAR_ID, LS_AVATAR_NAME, LS_BACKUP_KEY, LS_CHECKIN_DATUM } from '@/lib/constants'
import { Avatar } from '@/types/avatar'

// PRIVACY: nikdy neukládáme IP, device info ani žádná osobní data
// UUID je generováno čistě náhodně pomocí crypto.randomUUID()
export function useAvatar() {
  const { avatar, setAvatar, setLoading, setError } = useAvatarStore()

  useEffect(() => {
    async function inicializujAvatara() {
      try {
        setLoading(true)

        // Načti nebo vytvoř anonymní identitu z localStorage
        let avatarId = localStorage.getItem(LS_AVATAR_ID)
        let displayName = localStorage.getItem(LS_AVATAR_NAME)
        let backupKey = localStorage.getItem(LS_BACKUP_KEY)

        const jeNovy = !avatarId

        if (!avatarId) {
          avatarId = generujUUID()
          displayName = generujJmeno()
          backupKey = await generujBackupKey(avatarId)

          localStorage.setItem(LS_AVATAR_ID, avatarId)
          localStorage.setItem(LS_AVATAR_NAME, displayName)
          localStorage.setItem(LS_BACKUP_KEY, backupKey)
        }

        // Zkus načíst data z DB
        const response = await fetch(`/api/avatar/${avatarId}`)

        let avatarData: Avatar

        if (response.ok) {
          const dbData = await response.json()
          const { level, xpToNext } = levelZXP(dbData.xp)
          const dnesni = new Date().toISOString().slice(0, 10)
          const posledniCheckin = localStorage.getItem(LS_CHECKIN_DATUM)

          avatarData = {
            id: avatarId,
            displayName: displayName || dbData.display_name,
            level,
            xp: dbData.xp,
            xpToNext,
            stats: {
              morale:      dbData.morale,
              energy:      dbData.energy,
              burnout:     dbData.burnout,
              flex:        dbData.flex,
              overtimeMins: dbData.overtime_mins,
              loyalty:     dbData.loyalty,
            },
            influenceScore: dbData.influence_score,
            unlockedAbilities: dbData.unlocked_abilities || [],
            hasDoneCheckinToday: posledniCheckin === dnesni,
            lastCheckinDate: posledniCheckin,
            backupKey: backupKey || '',
            createdAt: dbData.created_at,
          }
        } else if (jeNovy) {
          // Vytvoř nový záznam v DB
          const createRes = await fetch('/api/avatar/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Avatar-Id': avatarId,
            },
            body: JSON.stringify({
              id: avatarId,
              display_name: displayName,
              backup_key: backupKey,
            }),
          })

          if (!createRes.ok) {
            throw new Error('Nepodařilo se vytvořit avatara')
          }

          const { level, xpToNext } = levelZXP(0)
          avatarData = {
            id: avatarId,
            displayName: displayName!,
            level,
            xp: 0,
            xpToNext,
            stats: {
              morale: 70, energy: 80, burnout: 10,
              flex: 0, overtimeMins: 0, loyalty: 50,
            },
            influenceScore: 0,
            unlockedAbilities: [],
            hasDoneCheckinToday: false,
            lastCheckinDate: null,
            backupKey: backupKey!,
            createdAt: new Date().toISOString(),
          }
        } else {
          throw new Error('Avatar nenalezen')
        }

        setAvatar(avatarData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chyba načítání')
      } finally {
        setLoading(false)
      }
    }

    inicializujAvatara()
  }, [setAvatar, setLoading, setError])

  return avatar
}
