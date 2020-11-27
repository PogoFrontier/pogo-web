import { FC } from 'react'
import { AppProps } from 'next/app'
import io from 'socket.io-client'
import SocketContext from '@context/SocketContext'
import '@common/css/layout.scss'

const SERVER = 'http://localhost:3000'
const socket = io(SERVER, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
})

/**
 * withRedux HOC
 * NextJS wrapper for Redux
 */

const CustomApp: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <SocketContext.Provider value={socket}>
      <Component {...pageProps} />
    </SocketContext.Provider>
  )
}

export default CustomApp
