import { createContext, Dispatch, SetStateAction } from 'react'

export type SocketContextType = {
    socket: WebSocket
    isSocketAuthenticated: boolean
    setIsSocketAuthenticated: Dispatch<SetStateAction<boolean>>
    connect: () => void
}

const SocketContext = createContext({} as SocketContextType)

export default SocketContext
