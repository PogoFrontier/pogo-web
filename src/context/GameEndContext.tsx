import { createContext } from 'react'

export interface MemberStatistics {
    name: string
    sid: number
    current: {
        hp: number
        energy: number
        damageDealt: number
        chargeMovesUsed: number
        timeSpendAlive: number
    }
}

const GameEndContext = createContext({} as {
    result: string
    data: MemberStatistics[],
    setResult: (result: string) => void
    setGameEndData: (data: MemberStatistics[]) => void
})

export default GameEndContext
