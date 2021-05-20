import axios from 'axios'
import standardStrings from './standardStrings.json'

type StringsType = typeof standardStrings
const supportedLanguages = ["English", "German", "Dutch"]

async function getStrings(locale: string) {
    try {      
        const response = await axios.get(supportedLanguages.includes(locale) ? `https://cors-anywhere.herokuapp.com/https://d1bbfbaqrr54l0.cloudfront.net/locale/${locale}.json` : `https://d1bbfbaqrr54l0.cloudfront.net/locale/English.json`)
        return response.data
    } catch (e) {
        console.log(e)
        return standardStrings
    }
}


export { getStrings, standardStrings, supportedLanguages }
export type { StringsType }