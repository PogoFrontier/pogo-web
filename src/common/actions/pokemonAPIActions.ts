import API from '@config/API'

export const getPokemonNames = async () => {
  try {
    const res = await API.get(`api/pokemon/names`)
    return res.data
  } catch (err) {
    return err
  }
}

export const getPokemonData = async (
  speciesId: string,
  movesetOption: 'original' | 'mainseries' | 'norestrictions'
) => {
  try {
    const res = await API.get(
      `api/pokemon/${speciesId}?movesetOption=${movesetOption}`
    )
    return res.data
  } catch (err) {
    return err
  }
}

export const getValidateTeam = async (team: string, meta: string) => {
  try {
    const res = await API.get(`api/pokemon/validate/${team}/${meta}`)
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
