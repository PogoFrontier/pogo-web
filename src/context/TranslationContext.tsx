import { createContext } from 'react'
import { standardStrings } from '@common/actions/getLanguage'

export const defaultStrings = standardStrings

const TranslationContext = createContext({} as any)

export default TranslationContext
