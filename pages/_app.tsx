import { FC, useEffect, useState } from 'react'
import { w3cwebsocket as WebSocket } from 'websocket'
import { AppProps } from 'next/app'
import SocketContext from '@context/SocketContext'
import { WSS, SERVER } from '@config/index'
import '@common/css/layout.scss'
import TeamContext, { defaultTeam } from '@context/TeamContext'
import { auth } from '../src/firebase'

const socket = new WebSocket(WSS)

/**
 * NextJS wrapper
 */

const CustomApp: FC<AppProps> = ({ Component, router, pageProps }) => {
  const [currentUser, setCurrentUser] = useState({})

  useEffect(() => {
    socket.onclose = () => {
      router.push('/')
    }
    auth.onAuthStateChanged(async (userAuth: any) => {
      if (userAuth) {
        fetch(`${SERVER}api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userAuth),
        }).then((res) => {
          res.json().then((createdUser) => {
            setCurrentUser(createdUser)
          })
        })
      }
    })
    return function cleanup() {
      socket.close()
    }
  }, [])

  return (
    <TeamContext.Provider value={defaultTeam}>
      <SocketContext.Provider value={socket}>
        {currentUser && currentUser}
        <Component {...pageProps} />
      </SocketContext.Provider>
    </TeamContext.Provider>
  )
}

export default CustomApp
