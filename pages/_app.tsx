import { FC, useEffect, useState } from 'react'
import { w3cwebsocket as WebSocket } from 'websocket'
import { setWsHeartbeat } from 'ws-heartbeat/client'
import { AppProps } from 'next/app'
import SocketContext from '@context/SocketContext'
import IdContext from '@context/IdContext'
import '@common/css/layout.scss'
import TeamContext, { defaultTeam } from '@context/TeamContext'
// import { auth } from '../src/firebase'
import UserContext, { User, UserTeam } from '@context/UserContext'
import HistoryContext from '@context/HistoryContext'
// import {
//   getUserProfile,
//   postNewGoogleUser,
//   signInWithGoogleId,
// } from '@common/actions/userAPIActions'
import { WSS } from '@config/index'
import { OnNewRoomPayload } from '@adibkhan/pogo-web-backend/index'
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import SettingsContext from '@context/SettingsContext'
import Head from 'next/head'
import { v4 as uuidv4 } from 'uuid'
import { isDesktop } from 'react-device-detect'
import { standardStrings, StringsType } from '@common/actions/getLanguage'
import TranslationContext, { defaultStrings } from '@context/TranslationContext'

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

const isRoomUrlRegex = new RegExp('\\/room.*|\\/matchup.*|\\/game.*')

const CustomApp: FC<AppProps> = ({ Component, router, pageProps }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentTeam, setCurrentTeam] = useState({} as UserTeam)
  const [currentStrings, setCurrentStrings] = useState<StringsType | null>(null)
  const [id, setId1] = useState('')
  const [socket, setSocket] = useState({} as WebSocket)
  const [keys, setKeys1] = useState(defaultKeys)
  const [showKeys, setShowKeys] = useState(isDesktop)
  const [routing, setRouting] = useState(false)
  const [prevRoute, setPrevRoute] = useState<string | null>(null)

  const [language, setLanguage] = useState('English')

  useEffect(() => {
    const keysFromStorage: any = localStorage.getItem('settings')
    if (
      typeof window !== undefined &&
      keysFromStorage &&
      keysFromStorage !== 'undefined'
    ) {
      const keysJSON = JSON.parse(keysFromStorage)
      if (keysJSON && keysJSON.fastKey) {
        setKeys1(keysJSON)
      }
    }
    // first try to load from localstorage and store in context
    const userFromStorage: string | null = localStorage.getItem('user')
    if (
      typeof window !== undefined &&
      userFromStorage &&
      userFromStorage !== 'undefined'
    ) {
      const userJSON = JSON.parse(userFromStorage)
      setCurrentUser(userJSON)
    } else {
      const newUser: User = {
        displayName: uuidv4(),
        teams: [],
      }
      setCurrentUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
    }
    const teamFromStorage: string | null = localStorage.getItem('team')
    if (
      typeof window !== undefined &&
      teamFromStorage &&
      teamFromStorage !== 'undefined'
    ) {
      const teamJSON: UserTeam = JSON.parse(teamFromStorage)
      setCurrentTeam(teamJSON)
    } else {
      setCurrentTeam(defaultTeam)
    }
    const stringsFromStorage: string | null = localStorage.getItem('strings')
    if (
      typeof window !== undefined &&
      stringsFromStorage &&
      stringsFromStorage !== 'undefined'
    ) {
      const stringsJSON = JSON.parse(stringsFromStorage)
      setCurrentStrings(stringsJSON)
    } else {
      setCurrentStrings(standardStrings)
      localStorage.setItem('strings', JSON.stringify(standardStrings))
    }
  }, [])

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (!isRoomUrlRegex.test(url) && socket.readyState) {
        socket.onclose = () => {
          // Do nothing
        }
        socket.close()
      }

      setRouting(true)
      setPrevRoute(url)
    }
    const handleRouteComplete = () => {
      setRouting(false)
    }
    router.events.on('routeChangeStart', handleRouteChange)
    router.events.on('routeChangeComplete', handleRouteComplete)
    return function cleanup() {
      router.events.off('routeChangeStart', handleRouteChange)
      router.events.off('routeChangeComplete', handleRouteComplete)
    }
  })

  const refreshUser = () => {
    // Yeet
  }

  const setTeams = (teams: any[]) => {
    const curr: User = { ...currentUser! }
    curr.teams = teams
    setCurrentUser(curr)
    localStorage.setItem('user', JSON.stringify(curr))
  }

  const connectAndJoin = (id1: string, payload: OnNewRoomPayload) => {
    connect(id1, (s: WebSocket) => {
      const data = { type: CODE.room, payload }
      s.send(JSON.stringify(data))
    })
  }

  const connect = (id1: string, callback: (socket: WebSocket) => void) => {
    const s: any = new WebSocket(`${WSS}${id1}`)
    setWsHeartbeat(s, '{"kind":"ping"}', {
      pingInterval: 30000, // every 30 seconds, send a ping message to the server.
      pingTimeout: 60000, // in 60 seconds, if no message accepted from server, close the connection.
    })
    s.onclose = () => {
      setRouting(false)
      router.push('/')
    }
    setSocket(s)
    setId1(id1)

    const x = setInterval(() => {
      if (s.readyState === WebSocket.OPEN) {
        callback(s)
        clearInterval(x)
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

  const setTeam = (t: UserTeam) => {
    localStorage.setItem('team', JSON.stringify(t))
    setCurrentTeam(t)
  }
  const setStrings = (s : StringsType) => {
    localStorage.setItem('strings', JSON.stringify(s))
    setCurrentStrings(s)
  }

  const clear = () => {
    if (window.confirm(currentStrings?.clear_data_confirmation ?? standardStrings.clear_data_confirmation)) {
      localStorage.clear()
      const newUser: User = {
        displayName: uuidv4(),
        teams: [],
      }
      setCurrentUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      setCurrentTeam(defaultTeam)
      setKeys1(defaultKeys)
      alert(currentStrings?.cookies_cleared ?? standardStrings.cookies_cleared)
    }
  }

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <SettingsContext.Provider
        value={{
          showKeys,
          keys,
          setShowKeys,
          setKeys,
          clear,
          language,
          setLanguage,
        }}
      >
        <IdContext.Provider value={{ id, setId }}>
          <UserContext.Provider
            value={{ user: currentUser!, refreshUser, setTeams }}
          >
            <TranslationContext.Provider value={{strings : defaultStrings, setStrings }}>
            <TeamContext.Provider value={{ team: currentTeam, setTeam }}>
              <SocketContext.Provider
                value={{ socket, connect, connectAndJoin }}
              >
                <HistoryContext.Provider value={{ prev: prevRoute, routing }}>
                  <Component {...pageProps} />
                </HistoryContext.Provider>
              </SocketContext.Provider>
            </TeamContext.Provider>
            </TranslationContext.Provider>
          </UserContext.Provider>
        </IdContext.Provider>
      </SettingsContext.Provider>
    </>
  )
}

export default CustomApp
