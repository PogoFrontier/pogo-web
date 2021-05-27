import API from '@config/API'
import { supportedLanguages } from '@context/LanguageContext'
import mapLanguage from './mapLanguage'

export const getPokemonNames = async (
  meta?: string,
  position?: number,
  showIllegal?: boolean,
  usedPoints?: number,
  className?: string,
  language?: string
) => {
  try {
    if (!position) {
      position = 0
    }
    if (!usedPoints) {
      usedPoints = 0
    }
    language = mapLanguage(language ?? 'English')
    const classString = className ? `&class=${className}` : ''
    const queryString = meta
      ? `?format=${meta}&position=${position}&showIllegal=${!!showIllegal}&usedPoints=${usedPoints}${classString}&language=${language}`
      : `?language=${language}`
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
  position?: number,
  className?: string
) => {
  try {
    const metaString = meta ? `&format=${meta}` : ''
    const positionString = position ? `&position=${position}` : ''
    const classString = className ? `&class=${className}` : ''
    const res = await API.get(
      `api/pokemon/${speciesId}?movesetOption=${movesetOption}${metaString}${positionString}${classString}`
    )
    return res.data
  } catch (err) {
    return err
  }
}

export const getValidateTeam = async (
  team: string,
  meta: string,
  lang: string
) => {
  try {
    lang = supportedLanguages.includes(lang) ? mapLanguage(lang) : 'en'
    const res = await API.get(`api/validate/${team}/${meta}/${lang}`)
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

export const getRandomPokemon = async (rule: string) => {
  try {
    const res = await API.get(`api/random/${rule}`)
    return res.data
  } catch (err) {
    return err
  }
}
