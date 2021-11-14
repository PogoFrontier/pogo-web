import { createContext } from 'react'


export interface FriendInfo {
  username: string
  status: string | null
  lastActivity?: {
    _seconds: number
  }
  id: string
}

const FriendContext = createContext({} as {
  isFriendRequestPossible: (username: string) => Promise<{
    possible: boolean,
    error?: string
  }>
  sendFriendRequest: (username: string) => Promise<any>
  declineFriendRequest: (id: string) => Promise<any>
  acceptFriendRequest: (id: string) => Promise<any>
  getFriends: () => Promise<any>
  unfriend: (id: string) => Promise<any>
})

export default FriendContext
