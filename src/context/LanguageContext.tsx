import { createContext } from 'react'

export const supportedLanguages = ['English', 'Dutch', 'German', 'French']

const LanguageContext = createContext({
  languages: supportedLanguages,
  strings: {} as any,
  current: 'en',
})

export default LanguageContext
