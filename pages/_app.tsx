import { FC } from 'react'
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

const CustomApp: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <TeamContext.Provider value={defaultTeam}>
      <SocketContext.Provider value={socket}>
        <Component {...pageProps} />
      </SocketContext.Provider>
    </TeamContext.Provider>
  )
}

export default CustomApp
