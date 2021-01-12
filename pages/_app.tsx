import { FC, useEffect, useState } from 'react'
import { w3cwebsocket as WebSocket } from 'websocket'
import { AppProps } from 'next/app'
import SocketContext from '@context/SocketContext'
import '@common/css/layout.scss'
import TeamContext, { defaultTeam } from '@context/TeamContext'
import { auth } from '../src/firebase'
import UserContext from '@context/UserContext'
import {
  postNewGoogleUser,
  signInWithGoogleId,
} from '@common/actions/userAPIActions'
import { WSS } from '@config/index'
import { OnNewRoomPayload } from '@adibkhan/pogo-web-backend/index'
import { CODE } from '@adibkhan/pogo-web-backend/actions'

/**
 * NextJS wrapper
 */

const CustomApp: FC<AppProps> = ({ Component, router, pageProps }) => {
  const [currentUser, setCurrentUser] = useState({})
  const [socket, setSocket] = useState({} as WebSocket)

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
      if (socket.readyState) {
        socket.close()
      }
    }
  }, [])

  const connect = (id: string, payload: OnNewRoomPayload) => {
    const s = new WebSocket(`${WSS}/${id}`)
    setSocket(s)
    const x = setInterval(() => {
      if (s.readyState === WebSocket.OPEN) {
        const data = { type: CODE.room, payload }
        s.send(JSON.stringify(data))
        clearInterval(x)
        router.push(`/matchup/${payload.room}`)
      } else if (s.readyState === WebSocket.CLOSED) {
        clearInterval(x)
      }
    }, 100)
  }

  return (
    <UserContext.Provider value={currentUser}>
      <TeamContext.Provider value={defaultTeam}>
        <SocketContext.Provider value={{ socket, connect }}>
          <Component {...pageProps} />
        </SocketContext.Provider>
      </TeamContext.Provider>
    </UserContext.Provider>
  )
}

export default CustomApp
