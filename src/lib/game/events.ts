import { EventKategorie } from '@/types/game'

export interface EventSablona {
  title: string
  description: string
  category: EventKategorie
  moraleDelta: number
  burnoutDelta: number
  energyDelta: number
  flexDelta: number
  overtimeDelta: number
  minimumAggression: number  // event se spawne jen když boss.aggression >= toto
}

export const EVENT_KATALOG: EventSablona[] = [
  // === REALISTICKÉ ===
  {
    title: 'Snížení HO limitu',
    description: 'Management oznamuje: home office redukován na 2 dny/týden. „Z důvodu collaborace a synergy."',
    category: 'realisticky',
    moraleDelta: -15, burnoutDelta: +10, energyDelta: -5, flexDelta: -20, overtimeDelta: 0,
    minimumAggression: 1,
  },
  {
    title: 'Nové turnikety v recepci',
    description: 'Od pondělí fungují biometrické turnikety. „Pro vaši bezpečnost." Čas průchodu: 3× delší.',
    category: 'realisticky',
    moraleDelta: -10, burnoutDelta: +5, energyDelta: -3, flexDelta: 0, overtimeDelta: +10,
    minimumAggression: 2,
  },
  {
    title: 'Hromadné odchody kolegů',
    description: 'Další tři lidi z vašeho týmu odevzdali výpověď. „Není čas smutnit, máme deadline."',
    category: 'realisticky',
    moraleDelta: -20, burnoutDelta: +15, energyDelta: -10, flexDelta: 0, overtimeDelta: +30,
    minimumAggression: 3,
  },
  {
    title: 'Povinná docházka 5 dní',
    description: 'Nová direktiva: všichni do kanceláře, každý den. „Kultura se buduje přítomností."',
    category: 'realisticky',
    moraleDelta: -18, burnoutDelta: +12, energyDelta: -8, flexDelta: -50, overtimeDelta: +20,
    minimumAggression: 4,
  },
  {
    title: 'Performance Review Season',
    description: 'Začíná kolo hodnocení. Každý musí vyplnit 47 formulářů o sobě i o kolegách.',
    category: 'realisticky',
    moraleDelta: -12, burnoutDelta: +18, energyDelta: -15, flexDelta: 0, overtimeDelta: +60,
    minimumAggression: 2,
  },
  {
    title: 'Nová reporting povinnost',
    description: 'Od teď každý pátek 2stranný status report pro management. „Aby měli přehled."',
    category: 'realisticky',
    moraleDelta: -8, burnoutDelta: +10, energyDelta: -8, flexDelta: 0, overtimeDelta: +30,
    minimumAggression: 1,
  },

  // === BIZARNÍ ===
  {
    title: 'Mandatory Smalltalk Protocol',
    description: 'HR zavedlo povinný ranní smalltalk 5 minut s náhodným kolegou. Účast se sleduje.',
    category: 'bizarni',
    moraleDelta: -5, burnoutDelta: +8, energyDelta: -10, flexDelta: 0, overtimeDelta: 0,
    minimumAggression: 1,
  },
  {
    title: 'Meeting Inception',
    description: 'Dnes je meeting, kde se plánuje meeting o výstupu z minulého meetingu. Povinná přítomnost.',
    category: 'bizarni',
    moraleDelta: -10, burnoutDelta: +12, energyDelta: -20, flexDelta: 0, overtimeDelta: +45,
    minimumAggression: 2,
  },
  {
    title: 'Nálada Audit Q3',
    description: 'Anonymní průzkum spokojenosti. Odpovědi se vyhodnocují podle IP adresy. „Anonymní."',
    category: 'bizarni',
    moraleDelta: -15, burnoutDelta: +5, energyDelta: -5, flexDelta: 0, overtimeDelta: 0,
    minimumAggression: 3,
  },
  {
    title: 'Mandatory Fun Friday',
    description: 'Dnes je povinné teambuilding odpoledne. Téma: „Inovace skrze hru." Docházka sledována.',
    category: 'bizarni',
    moraleDelta: -8, burnoutDelta: +10, energyDelta: -5, flexDelta: 0, overtimeDelta: +120,
    minimumAggression: 2,
  },
  {
    title: 'Core Values Workshop',
    description: 'Dvouhodinový workshop o firemních hodnotách. Integrity, Innovation, Impact. Povinný.',
    category: 'bizarni',
    moraleDelta: -12, burnoutDelta: +8, energyDelta: -12, flexDelta: 0, overtimeDelta: +120,
    minimumAggression: 1,
  },
  {
    title: 'Nový email etiketa kodex',
    description: '17stránkový dokument o správném formátování emailů. Třeba ho do pátku přečíst a podepsat.',
    category: 'bizarni',
    moraleDelta: -6, burnoutDelta: +6, energyDelta: -5, flexDelta: 0, overtimeDelta: +20,
    minimumAggression: 1,
  },
  {
    title: 'Digital Transformation Town Hall',
    description: 'Management prezentuje „budoucnost banky". 90 minut slidů s buzzwords. Q&A zakázáno.',
    category: 'bizarni',
    moraleDelta: -10, burnoutDelta: +10, energyDelta: -15, flexDelta: 0, overtimeDelta: +90,
    minimumAggression: 2,
  },
]

export function vyberDenniEventy(aggression: number, adaptation: number): EventSablona[] {
  // Počet eventů roste s agresí
  const pocetEventu = Math.min(1 + Math.floor(aggression / 3), 3)

  // Filtruj podle minimumAggression
  const dostupne = EVENT_KATALOG.filter(e => e.minimumAggression <= aggression)
  if (dostupne.length === 0) return []

  // Weighted random výběr — vyšší aggression = těžší eventy
  const vybrane: EventSablona[] = []
  const shuffled = [...dostupne].sort(() => Math.random() - 0.5)

  for (let i = 0; i < Math.min(pocetEventu, shuffled.length); i++) {
    // adaptation zvyšuje šanci na bizarní eventy (boss se přizpůsobuje)
    const bizarni = shuffled.filter(e => e.category === 'bizarni')
    const realisticke = shuffled.filter(e => e.category === 'realisticky')
    const sanceBizarni = 0.3 + (adaptation / 100) * 0.4

    let kandidat: EventSablona
    if (Math.random() < sanceBizarni && bizarni.length > 0) {
      kandidat = bizarni[Math.floor(Math.random() * bizarni.length)]
    } else if (realisticke.length > 0) {
      kandidat = realisticke[Math.floor(Math.random() * realisticke.length)]
    } else {
      kandidat = shuffled[i]
    }

    if (!vybrane.includes(kandidat)) {
      vybrane.push(kandidat)
    }
  }

  return vybrane
}
