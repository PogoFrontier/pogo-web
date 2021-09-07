import { createContext } from 'react'

const FriendContext = createContext({
  isFriendRequestPossible: (_: string) => {
    return Promise.resolve({
      possible: false,
      error: ""
    })
  },
  sendFriendRequest: (_: string) => {
    return Promise.resolve(undefined)
  },
  declineFriendRequest: (_: string) => {
    return Promise.resolve(undefined)
  },
  acceptFriendRequest: (_: string) => {
    return Promise.resolve(undefined)
  },
  getFriends: () => {
    return Promise.resolve(undefined)
  },
} as {
  isFriendRequestPossible: (username: string) => Promise<{
    possible: boolean,
    error?: string
  }>
  sendFriendRequest: (username: string) => Promise<any>
  declineFriendRequest: (id: string) => Promise<any>
  acceptFriendRequest: (id: string) => Promise<any>
  getFriends: () => Promise<any>
})

export default FriendContext
