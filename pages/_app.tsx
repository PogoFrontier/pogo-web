import { FC, useEffect, useState } from 'react'
import { w3cwebsocket as WebSocket } from 'websocket'
import { AppProps } from 'next/app'
import SocketContext from '@context/SocketContext'
import { WSS, SERVER } from '@config/index'
import '@common/css/layout.scss'
import TeamContext, { defaultTeam } from '@context/TeamContext'
import { auth } from '../src/firebase'
import UserContext from '@context/UserContext'
import Header from '@components/header/Header'

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
        // fetch if user exists first
        // if exists, redirect to sign up form
        // else, get data to sign in
        fetch(`${SERVER}api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAuth }),
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
    <UserContext.Provider value={currentUser}>
      <TeamContext.Provider value={defaultTeam}>
        <SocketContext.Provider value={socket}>
          <Header />
          <Component {...pageProps} />
        </SocketContext.Provider>
      </TeamContext.Provider>
    </UserContext.Provider>
  )
}

export default CustomApp
