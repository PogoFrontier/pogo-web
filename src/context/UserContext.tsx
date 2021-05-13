import { TeamMember } from '@adibkhan/pogo-web-backend'
import { createContext } from 'react'

export interface UserTeam {
  name: string
  id: string
  format: string
  members: TeamMember[]
}

export interface User {
  googleId?: string
  displayName: string
  email?: string
  teams: UserTeam[]
  createdAt?: string
  lastLogin?: string
  isDeleted?: boolean
}

const UserContext = createContext({
  user: {} as User,
  setUser: () => {
    return
  },
  setTeams: (_teams: any[]) => {
    return
  },
})

export default UserContext
