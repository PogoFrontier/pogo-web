const metaMap: {
  [key: string]: {
    name: string
    maxCP: number
    movesetOption: 'original' | 'mainseries' | 'norestrictions'
  }
} = {
  'Great League': {
    name: 'Great',
    maxCP: 1500,
    movesetOption: 'original',
  },
  'MainSeries Cup': {
    name: 'MainSeries',
    maxCP: 1500,
    movesetOption: 'mainseries',
  },
  'Ultra League': {
    name: 'Ultra',
    maxCP: 2500,
    movesetOption: 'original',
  },
  'Master League': {
    name: 'Master',
    maxCP: 10000,
    movesetOption: 'original',
  },
}

export default metaMap
