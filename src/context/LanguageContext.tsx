import { StringsType } from '@common/actions/getLanguage'
import { createContext } from 'react'

export const supportedLanguages = [
  'English',
  'Dutch',
  'German',
  'French',
  'Spanish',
]

const LanguageContext = createContext({
  languages: supportedLanguages,
  strings: {} as StringsType,
  current: 'en',
})

export default LanguageContext
