import { createContext } from 'react'

export interface History {
  prev: string | null
  routing: boolean
}

const HistoryContext = createContext({} as History)

export default HistoryContext
