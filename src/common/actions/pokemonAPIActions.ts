import axios from 'axios'
import { SERVER } from '@config/index'

export const getPokemonNames = async () => {
  try {
    const res = await axios.get(`${SERVER}api/pokemon/names`)
    return res.data
  } catch (err) {
    return err
  }
}

export const getPokemonData = async (speciesId: string) => {
  try {
    const res = await axios.get(`${SERVER}api/pokemon/${speciesId}`)
    return res.data
  } catch (err) {
    return err
  }
}

export const getValidateTeam = async (team: string, meta: string) => {
  try {
    const res = await axios.get(`${SERVER}api/pokemon/validate/${team}/${meta}`)
    return res.data
  } catch (err) {
    return err.message
  }
}
