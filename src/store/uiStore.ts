import { create } from 'zustand'
import { BossEvent } from '@/types/game'
import { DenniReport } from '@/types/game'

interface UIStore {
  isBossInterruptActive: boolean
  bossInterruptEvent: BossEvent | null
  isBackupKeyModalOpen: boolean
  isDailyReportVisible: boolean
  lastDailyReport: DenniReport | null
  isCheckinInProgress: boolean

  triggerBossInterrupt: (event: BossEvent) => void
  dismissInterrupt: () => void
  openBackupKeyModal: () => void
  closeBackupKeyModal: () => void
  showDailyReport: (report: DenniReport) => void
  hideDailyReport: () => void
  setCheckinInProgress: (v: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  isBossInterruptActive: false,
  bossInterruptEvent: null,
  isBackupKeyModalOpen: false,
  isDailyReportVisible: false,
  lastDailyReport: null,
  isCheckinInProgress: false,

  triggerBossInterrupt: (event) => set({
    isBossInterruptActive: true,
    bossInterruptEvent: event,
  }),
  dismissInterrupt: () => set({
    isBossInterruptActive: false,
    bossInterruptEvent: null,
  }),
  openBackupKeyModal: () => set({ isBackupKeyModalOpen: true }),
  closeBackupKeyModal: () => set({ isBackupKeyModalOpen: false }),
  showDailyReport: (report) => set({
    isDailyReportVisible: true,
    lastDailyReport: report,
  }),
  hideDailyReport: () => set({ isDailyReportVisible: false }),
  setCheckinInProgress: (v) => set({ isCheckinInProgress: v }),
}))
