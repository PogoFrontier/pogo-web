import { createContext } from 'react'

const UserContext = createContext({
  user: {} as any,
  refreshUser: () => {
    return
  },
})

export default UserContext
