import { createContext } from 'react'

export interface User {
  googleId?: string
  displayName: string
  email?: string
  teams: any[]
  createdAt?: string
  lasLogin?: string
  isDeleted?: boolean
}

const UserContext = createContext({
  user: {} as User,
  refreshUser: () => {
    return
  },
  setTeams: (_teams: any[]) => {
    return
  },
})

export default UserContext
