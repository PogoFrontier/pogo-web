import { FC, useEffect, useState } from 'react'
import { w3cwebsocket as WebSocket } from 'websocket'
import { setWsHeartbeat, WebSocketBase } from 'ws-heartbeat/client'
import { AppProps } from 'next/app'
import SocketContext from '@context/SocketContext'
import IdContext from '@context/IdContext'
import '@common/css/layout.scss'
import TeamContext, { defaultTeam } from '@context/TeamContext'
// import { auth } from '../src/firebase'
import UserContext, { User } from '@context/UserContext'
// import {
//   getUserProfile,
//   postNewGoogleUser,
//   signInWithGoogleId,
// } from '@common/actions/userAPIActions'
import { WSS } from '@config/index'
import { OnNewRoomPayload } from '@adibkhan/pogo-web-backend/index'
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import SettingsContext from '@context/SettingsContext'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import Head from 'next/head'
import { v4 as uuidv4 } from 'uuid'

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
  const [currentTeam, setCurrentTeam] = useState(defaultTeam)
  const [id, setId1] = useState('')
  const [socket, setSocket] = useState({} as WebSocket)
  const [keys, setKeys1] = useState(defaultKeys)

  useEffect(() => {
    // first try to load from localstorage and store in context
    const userFromStorage: any = localStorage.getItem('user')
    if (
      typeof window !== undefined &&
      userFromStorage &&
      userFromStorage !== 'undefined'
    ) {
      // if (userFromStorage.googleId) {
      //   // user is from db
      //   signInWithGoogleId(userFromStorage.googleId)
      //     .then((res) => {
      //       if (res.error) {
      //         setCurrentUser(null)
      //       } else {
      //         setCurrentUser(res.userData)
      //         if (res.userData.teams && res.userData.teams[0]) {
      //           setCurrentTeam(res.userData.teams[0].members)
      //         }
      //       }
      //     })
      //     .catch(() => setCurrentUser(null))
      // } else {
      const userJSON = JSON.parse(userFromStorage)
      if (
        userJSON.teams &&
        userJSON.teams[0] &&
        userJSON.teams[0].members.length > 0
      ) {
        setCurrentTeam(userJSON.teams[0].members)
      }
      setCurrentUser(userJSON)
      // }
    } else {
      const newUser: User = {
        displayName: uuidv4(),
        teams: [],
      }
      setCurrentUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      //   // sign in user and store in context
      //   auth.onAuthStateChanged(async (userAuth: any) => {
      //     if (userAuth) {
      //       signInWithGoogleId(userAuth.uid)
      //         .then((res) => {
      //           if (res.error) {
      //             postNewGoogleUser(userAuth)
      //               .then((newRes) => {
      //                 if (!newRes.error) {
      //                   setCurrentUser(newRes.userData)
      //                   if (typeof window !== undefined) {
      //                     localStorage.setItem(
      //                       'user',
      //                       JSON.stringify(newRes.userData)
      //                     )
      //                     localStorage.setItem('token', newRes.token)
      //                   }
      //                 }
      //               })
      //               .catch(() => setCurrentUser(null))
      //           } else {
      //             setCurrentUser(res.userData)
      //             if (res.userData.teams && res.userData.teams[0]) {
      //               setCurrentTeam(res.userData.teams[0].members)
      //             }
      //             if (typeof window !== undefined) {
      //               localStorage.setItem('user', JSON.stringify(res.userData))
      //               localStorage.setItem('token', res.token)
      //             }
      //           }
      //         })
      //         .catch(() => setCurrentUser(null))
      //     } else {
      //       return
      //     }
      //   })
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
    // if (localStorage.getItem('token')) {
    //   const token: any = localStorage.getItem('token')
    //   getUserProfile(token)
    //     .then((res) => {
    //       if (!res.error) {
    //         setCurrentUser(res)
    //         if (res.teams && res.teams[0]) {
    //           setCurrentTeam(res.teams[0])
    //         }
    //         localStorage.setItem('user', JSON.stringify(res))
    //       }
    //     })
    //     .catch(() => setCurrentUser(null))
    // }
  }

  const setTeams = (teams: any[]) => {
    const curr: User = { ...currentUser! }
    curr.teams = teams
    setCurrentUser(curr)
    localStorage.setItem('user', JSON.stringify(curr))
  }

  const connect = (id1: string, payload: OnNewRoomPayload) => {
    const s: any = new WebSocket(`${WSS}${id1}`)
    setWsHeartbeat(s as WebSocketBase, '{"kind":"ping"}', {
      pingInterval: 30000, // every 30 seconds, send a ping message to the server.
      pingTimeout: 60000, // in 60 seconds, if no message accepted from server, close the connection.
    })
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

  const setTeam = (t: TeamMember[]) => {
    setCurrentTeam(t)
  }

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <SettingsContext.Provider value={{ keys, setKeys }}>
        <IdContext.Provider value={{ id, setId }}>
          <UserContext.Provider
            value={{ user: currentUser!, refreshUser, setTeams }}
          >
            <TeamContext.Provider value={{ team: currentTeam, setTeam }}>
              <SocketContext.Provider value={{ socket, connect }}>
                <Component {...pageProps} />
              </SocketContext.Provider>
            </TeamContext.Provider>
          </UserContext.Provider>
        </IdContext.Provider>
      </SettingsContext.Provider>
    </>
  )
}

export default CustomApp
