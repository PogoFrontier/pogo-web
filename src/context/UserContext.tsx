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
  displayName: string | null
  email?: string | null
  teams: UserTeam[]
  createdAt?: string
  lastLogin?: string
  isDeleted?: boolean /* ,
  token?: string */
}

const UserContext = createContext({
  user: {} as User,
  setUser: (_user: User) => {
    return
  },
  setTeams: (_teams: any[]) => {
    return
  },
})

export default UserContext
