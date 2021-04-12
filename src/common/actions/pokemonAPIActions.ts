import API from '@config/API'

export const getPokemonNames = async () => {
  try {
    const res = await API.get(`api/pokemon/names`)
    return res.data
  } catch (err) {
    return err
  }
}

export const getPokemonData = async (speciesId: string) => {
  try {
    const res = await API.get(`api/pokemon/${speciesId}`)
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
