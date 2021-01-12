import { FC, useEffect, useState } from 'react'
import { w3cwebsocket as WebSocket } from 'websocket'
import { AppProps } from 'next/app'
import SocketContext from '@context/SocketContext'
import { WSS } from '@config/index'
import '@common/css/layout.scss'
import TeamContext, { defaultTeam } from '@context/TeamContext'
import { auth } from '../src/firebase'
import UserContext from '@context/UserContext'
import {
  postNewGoogleUser,
  signInWithGoogleId,
} from '@common/actions/userAPIActions'
import { v4 as uuidv4 } from 'uuid'
const socket = new WebSocket(`${WSS}/${uuidv4()}`)

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
        signInWithGoogleId(userAuth.uid)
          .then((res) => {
            if (res.error) {
              postNewGoogleUser(userAuth)
                .then((newRes) => {
                  if (newRes.error) {
                    setCurrentUser({})
                  } else {
                    setCurrentUser(newRes.userData)
                  }
                })
                .catch(() => setCurrentUser({}))
            } else {
              setCurrentUser(res.userData)
            }
          })
          .catch(() => setCurrentUser({}))
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
          <Component {...pageProps} />
        </SocketContext.Provider>
      </TeamContext.Provider>
    </UserContext.Provider>
  )
}

export default CustomApp
