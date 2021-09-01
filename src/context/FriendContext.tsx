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
} as {
  isFriendRequestPossible: (username: string) => Promise<{
    possible: boolean,
    error?: string
  }>
  sendFriendRequest: (username: string) => Promise<any>
})

export default FriendContext
