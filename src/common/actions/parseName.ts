const parseName = (name: string) => {
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
