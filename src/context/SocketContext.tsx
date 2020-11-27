import { createContext } from 'react'

const SocketContext = createContext({} as SocketIOClient.Socket)

export default SocketContext