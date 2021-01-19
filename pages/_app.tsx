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
  getUserProfile,
  postNewGoogleUser,
  signInWithGoogleId,
} from '@common/actions/userAPIActions'

const socket = new WebSocket(WSS)

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

const CustomApp: FC<AppProps> = ({ Component, router, pageProps }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    socket.onclose = () => {
      router.push('/')
    }
    // first try to load from localstorage and store in context
    if (typeof window !== undefined && localStorage.getItem('user')) {
      const userFromStorage: any = localStorage.getItem('user')
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
      socket.close()
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

  return (
    <UserContext.Provider value={{ user: currentUser, refreshUser }}>
      <TeamContext.Provider value={defaultTeam}>
        <SocketContext.Provider value={socket}>
          <Component {...pageProps} />
        </SocketContext.Provider>
      </TeamContext.Provider>
    </UserContext.Provider>
  )
}

export default CustomApp
