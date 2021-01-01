import { FC, useEffect } from 'react'
import { w3cwebsocket as WebSocket } from 'websocket'
import { AppProps } from 'next/app'
import SocketContext from '@context/SocketContext'
import { WSS } from '@config/index'
import '@common/css/layout.scss'
import TeamContext, { defaultTeam } from '@context/TeamContext'
const socket = new WebSocket(WSS)

/**
 * NextJS wrapper
 */

const CustomApp: FC<AppProps> = ({ Component, router, pageProps }) => {
  useEffect(() => {
    socket.onclose = () => {
      router.push('/')
    }
    return function cleanup() {
      socket.close()
    }
  }, [])

  return (
    <TeamContext.Provider value={defaultTeam}>
      <SocketContext.Provider value={socket}>
        <Component {...pageProps} />
      </SocketContext.Provider>
    </TeamContext.Provider>
  )
}

export default CustomApp
