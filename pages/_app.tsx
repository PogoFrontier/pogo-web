import { FC } from 'react'
import { AppProps } from 'next/app'
import io from 'socket.io-client'
import SocketContext from '@context/SocketContext'
import { SERVER } from '@config/index'
import '@common/css/layout.scss'
import TeamContext, { defaultTeam } from '@context/TeamContext'

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
    <TeamContext.Provider value={defaultTeam}>
      <SocketContext.Provider value={socket}>
        <Component {...pageProps} />
      </SocketContext.Provider>
    </TeamContext.Provider>
  )
}

export default CustomApp
