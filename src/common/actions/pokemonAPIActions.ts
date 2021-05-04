import API from '@config/API'

export const getPokemonNames = async (
  meta?: string,
  position?: number,
  showIllegal?: boolean,
  usedPoints?: number
) => {
  try {
    if (!position) {
      position = 0
    }
    if (!usedPoints) {
      usedPoints = 0
    }
    const queryString = meta
      ? `?format=${meta}&position=${position}&showIllegal=${!!showIllegal}&usedPoints=${usedPoints}`
      : ''
    const res = await API.get(`api/pokemon${queryString}`)
    return res.data
  } catch (err) {
    return err
  }
}

export const getPokemonData = async (
  speciesId: string,
  movesetOption: 'original' | 'mainseries' | 'norestrictions',
  meta?: string,
  position?: number
) => {
  try {
    const metaString = meta ? `&format=${meta}` : ''
    const positionString = position ? `&position=${position}` : ''
    const res = await API.get(
      `api/pokemon/${speciesId}?movesetOption=${movesetOption}${metaString}${positionString}`
    )
    return res.data
  } catch (err) {
    return err
  }
}

export const getValidateTeam = async (team: string, meta: string) => {
  try {
    const res = await API.get(`api/validate/${team}/${meta}`)
    return res.data
  } catch (err) {
    return err.message
  }
}

export const parseToRule = async (rule: string) => {
  try {
    const res = await API.get(`api/rule/${rule}`)
    return res.data
  } catch (err) {
    return err.message
  }
}
