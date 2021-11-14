const metaMap: {
  [key: string]: {
    name: string
    maxCP: number
    movesetOption: 'original' | 'mainseries' | 'norestrictions'
    classes?: string[]
    unranked?: boolean
    random?: boolean
  }
} = {
  'Great League': {
    name: 'Great League',
    maxCP: 1500,
    movesetOption: 'original',
  },
  'Great League_UNRANKED': {
    name: 'Great League (Unranked)',
    maxCP: 1500,
    movesetOption: 'original',
    unranked: true,
  },
  'Autorekt': {
    name: 'Autorekt',
    maxCP: 1500,
    movesetOption: 'original',
    random: true
  },
  'Lunar Cup': {
    name: 'Lunar Cup',
    maxCP: 1500,
    movesetOption: 'original',
  },
  'Brawler Cup': {
    name: 'Brawler Cup',
    maxCP: 1500,
    movesetOption: 'original',
  },
  'Specialist Cup': {
    name: 'Specialist Cup',
    maxCP: 1500,
    movesetOption: 'original',
    classes: [
      'Ranger',
      'Ace Trainer',
      'Beauty',
      'Scientist',
      'Rogue',
      'Hiker',
      'Mystic',
      'Warlord',
    ],
  },
  'Nursery Cup': {
    name: 'Nursery Cup',
    maxCP: 1500,
    movesetOption: 'original',
  },
  Cliffhanger: {
    name: 'Cliffhanger',
    maxCP: 1500,
    movesetOption: 'original',
  },
  'MainSeries Cup': {
    name: 'MainSeries Cup',
    maxCP: 1500,
    movesetOption: 'mainseries',
  },
  'Ultra League': {
    name: 'Ultra League',
    maxCP: 2500,
    movesetOption: 'original',
  },
  'Master League': {
    name: 'Master League',
    maxCP: 10000,
    movesetOption: 'original',
  },
}

export default metaMap
