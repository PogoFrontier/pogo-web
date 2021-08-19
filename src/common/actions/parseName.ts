const parseName = (name: string) => {
  if (name === 'Cherrim (Sunshine)') {
    return 'cherrim_sunny'
  }
  if (name === 'Shellos (East)') {
    return 'shellos_east_sea'
  }
  if (name === 'Gastrodon (East)') {
    return 'gastrodon_east_sea'
  }
  if (name === 'Shellos (West)') {
    return 'shellos_west_sea'
  }
  if (name === 'Gastrodon (West)') {
    return 'gastrodon_west_sea'
  }
  if (name === 'Darmanitan (Galarian)') {
    return 'darmanitan_galarian_standard'
  }
  if (name === 'Meowstic (Male)') {
    return 'meowstic'
  }

  return name
  .toLowerCase()
  .replace(/[()]/g, '')
  .replace(/\s/g, '_')
  .replace(/-/g, '_')
  .replace(/♀/g, '_female')
  .replace(/♂/g, '_male')
  .replace(/\./g, '')
  .replace(/\'/g, '')
}

export default parseName
