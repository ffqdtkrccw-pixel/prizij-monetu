// Generuje anonymní jméno — žádné osobní údaje, čistě korporátní nonsens

const PREDPONY = [
  'MeetingSurvivor', 'SlidedeckHero', 'SynergySeeker', 'KPIWarrior',
  'AlignmentGuru', 'PivotMaster', 'BenchmarkBoss', 'AgileZombie',
  'SprintGhost', 'OKRPhantom', 'StandupGhost', 'FeedbackLoop',
  'CoreValueBot', 'TurniketVetern', 'HObojovnik', 'PresentacePrezivy',
  'ExcelMartyr', 'CallBridgeSoul', 'ReportingDrone', 'TeambuildingEvader',
]

const PRIPONY = [
  '404', '418', '482', '007', '101', '666', '999', '777',
  'X', 'Zero', 'Alpha', 'Beta', 'Omega', 'NaN', 'NULL', 'EOF',
  'II', 'III', 'Pro', 'Plus', 'Max', 'Ultra', 'Turbo',
]

export function generujJmeno(): string {
  const predpona = PREDPONY[Math.floor(Math.random() * PREDPONY.length)]
  const pripona  = PRIPONY[Math.floor(Math.random() * PRIPONY.length)]
  return `${predpona}_${pripona}`
}

export function generujUUID(): string {
  // Vždy crypto.randomUUID — žádné device fingerprinting
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback pro starší prostředí (nemělo by nastat)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export async function generujBackupKey(avatarId: string): Promise<string> {
  // SHA-256 z UUID — nelze zpětně dohledat identitu, slouží pouze k obnově
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder()
    const data = encoder.encode(avatarId + 'przijmonetu')
    const hash = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hash))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 20).toUpperCase()
  }
  // Fallback
  return avatarId.replace(/-/g, '').substring(0, 20).toUpperCase()
}
