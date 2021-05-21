import { createContext } from 'react'

export const supportedLanguages = [
    "English",
    "Dutch",
    "German",
    "French"
]

const LanguageContext = createContext({
    languages: supportedLanguages,
    strings: {} as any
})

export default LanguageContext