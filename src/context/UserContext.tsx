import { TeamMember } from '@adibkhan/pogo-web-backend'
import { createContext } from 'react'

export interface UserTeam {
  name: string
  id: string
  format: string
  members: TeamMember[]
}

export interface FriendRequest {
  id: string
  username: string
}

export interface User {
  googleId?: string
  username?: string
  email?: string | null
  teams: UserTeam[]
  requests?: FriendRequest[]
  battleHistory?: Array<{
    googleId: string
    username: string
    isGuest: boolean
  }>
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
  setUsername: async (_username: string) => {
    return
  },
  loadUser: () => {}
})

export default UserContext
