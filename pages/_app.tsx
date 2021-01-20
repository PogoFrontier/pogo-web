import { FC, useEffect, useState } from 'react'
import { w3cwebsocket as WebSocket } from 'websocket'
import { AppProps } from 'next/app'
import SocketContext from '@context/SocketContext'
import IdContext from '@context/IdContext'
import '@common/css/layout.scss'
import TeamContext, { defaultTeam } from '@context/TeamContext'
import { auth } from '../src/firebase'
import UserContext from '@context/UserContext'
import {
  getUserProfile,
  postNewGoogleUser,
  signInWithGoogleId,
} from '@common/actions/userAPIActions'
import { WSS } from '@config/index'
import { OnNewRoomPayload } from '@adibkhan/pogo-web-backend/index'
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import SettingsContext from '@context/SettingsContext'

interface User {
  googleId?: string
  displayName: string
  email?: string
  teams: any[]
  createdAt?: string
  lasLogin?: string
  isDeleted?: boolean
}

/**
 * NextJS wrapper
 */

const defaultKeys = {
  fastKey: ' ',
  charge1Key: 'q',
  charge2Key: 'w',
  switch1Key: 'a',
  switch2Key: 's',
  shieldKey: 'd',
}

const CustomApp: FC<AppProps> = ({ Component, router, pageProps }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [id, setId1] = useState('')
  const [socket, setSocket] = useState({} as WebSocket)
  const [keys, setKeys1] = useState(defaultKeys)

  useEffect(() => {
    // first try to load from localstorage and store in context
    const userFromStorage: any = localStorage.getItem('user')
    if (typeof window !== undefined && userFromStorage) {
      if (userFromStorage.googleId) {
        // user is from db
        signInWithGoogleId(userFromStorage.googleId)
          .then((res) => {
            res.error ? setCurrentUser(null) : setCurrentUser(res.userData)
          })
          .catch(() => setCurrentUser(null))
      } else {
        // its just a local guest
        setCurrentUser(JSON.parse(userFromStorage))
      }
    } else {
      // sign in user and store in context
      auth.onAuthStateChanged(async (userAuth: any) => {
        if (userAuth) {
          signInWithGoogleId(userAuth.uid)
            .then((res) => {
              if (res.error) {
                postNewGoogleUser(userAuth)
                  .then((newRes) => {
                    if (!newRes.error) {
                      setCurrentUser(newRes.userData)
                      if (typeof window !== undefined) {
                        localStorage.setItem(
                          'user',
                          JSON.stringify(newRes.userData)
                        )
                        localStorage.setItem('token', newRes.token)
                      }
                    }
                  })
                  .catch(() => setCurrentUser(null))
              } else {
                // console.log(res)
                setCurrentUser(res.userData)
                if (typeof window !== undefined) {
                  localStorage.setItem('user', JSON.stringify(res.userData))
                  localStorage.setItem('token', res.token)
                }
              }
            })
            .catch(() => setCurrentUser(null))
        } else {
          return
        }
      })
    }
    return function cleanup() {
      if (socket.readyState) {
        socket.close()
      }
    }
  }, [])

  const refreshUser = () => {
    // use token (store in localStorage! (res from signin)) to getUserProfile from API
    // then update currentUser and localStorage
    if (localStorage.getItem('token')) {
      const token: any = localStorage.getItem('token')
      getUserProfile(token)
        .then((res) => {
          if (!res.error) {
            setCurrentUser(res)
            localStorage.setItem('user', JSON.stringify(res))
          }
        })
        .catch(() => setCurrentUser(null))
    }
  }

  const connect = (id1: string, payload: OnNewRoomPayload) => {
    const s = new WebSocket(`${WSS}${id1}`)
    s.onclose = () => {
      router.push('/')
    }
    setSocket(s)
    setId1(id1)
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

  const setId = (id1: string) => {
    setId1(id1)
  }

  const setKeys = (keys1: typeof defaultKeys) => {
    setKeys1(keys1)
  }

  return (
    <SettingsContext.Provider value={{ keys, setKeys }}>
      <IdContext.Provider value={{ id, setId }}>
        <UserContext.Provider value={{ user: currentUser, refreshUser }}>
          <TeamContext.Provider value={defaultTeam}>
            <SocketContext.Provider value={{ socket, connect }}>
              <Component {...pageProps} />
            </SocketContext.Provider>
          </TeamContext.Provider>
        </UserContext.Provider>
      </IdContext.Provider>
    </SettingsContext.Provider>
  )
}

export default CustomApp
