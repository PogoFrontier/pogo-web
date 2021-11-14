import React, { useState, createContext, useContext, useEffect } from 'react'
import { Move } from '@adibkhan/pogo-web-backend'
import API from '../../config/API'

export type PokemonMovesObject = { [move: string]: Move } | null

export type PokemonMovesContextType =
  | [
      PokemonMovesObject,
      React.Dispatch<React.SetStateAction<PokemonMovesObject>>
    ]
  | null

const useMoves: () => PokemonMovesContextType = () => {
  return useContext<PokemonMovesContextType>(PokemonMovesContext)
}
const PokemonMovesContext = createContext<PokemonMovesContextType>(null)

const PokemonMovesContextProvider: React.FC = ({ children }) => {
  useEffect(() => {
    ;(async () => {
      try {
        const res = await API.get<{ [move: string]: Move }>('api/moves')
        setMoves(res.data)
      } catch (e) {
        setMoves(null)
      }
    })()
  }, [])
  const [moves, setMoves] = useState<PokemonMovesObject>(null)
  return (
    <PokemonMovesContext.Provider value={[moves, setMoves]}>
      {children}
    </PokemonMovesContext.Provider>
  )
}

export default PokemonMovesContextProvider
export { useMoves }
