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
import { getUserProfile, updateUserTeams } from '@common/actions/userAPIActions'
import { CDN_BASE_URL, WSS } from '@config/index'
import SettingsContext from '@context/SettingsContext'
import Head from 'next/head'
import { v4 as uuidv4 } from 'uuid'
import { isDesktop } from 'react-device-detect'
import axios from 'axios'
import LanguageContext, { supportedLanguages } from '@context/LanguageContext'
import { standardStrings, StringsType } from '@common/actions/getLanguage'
import mapLanguage from '@common/actions/mapLanguage'
import getUserToken from '@common/actions/getUserToken'

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
  const [id, setId1] = useState('')
  const [socket, setSocket] = useState({} as WebSocket)
  const [isSocketAuthenticated, setIsSocketAuthenticated] = useState(false)
  const [keys, setKeys1] = useState(defaultKeys)
  const [showKeys, setShowKeys] = useState(isDesktop)
  const [routing, setRouting] = useState(false)
  const [prevRoute, setPrevRoute] = useState<string | null>(null)
  const [userToken, setUserToken] = useState<string | null>(null)
  const [language, setLanguage1] = useState('English')
  const [strings, setStrings] = useState<StringsType>(standardStrings)

  const fetchStrings = async (lang: string) => {
    lang = supportedLanguages.includes(lang) ? mapLanguage(lang) : 'en'
    const res = await axios.get(`${CDN_BASE_URL}/locale/${lang}.json`)
    if (res.data) {
      const d: any = {}
      for (const key of Object.keys(res.data)) {
        d[key] = res.data[key]
      }
      setStrings(d)
    }
  }

  useEffect(() => {
    fetchStrings(language)
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
    // actually, first try loading authed user data from local, //use user token instead, go right to profile!
    // then load from firebase if there is one
    // or create local user if there is none
    // and then store in context

    const userTokenFromStorage: string | null = localStorage.getItem(
      'userToken'
    )
    if (
      typeof window !== undefined &&
      userTokenFromStorage &&
      userTokenFromStorage !== 'undefined'
    ) {
      const parsedUserToken = JSON.parse(userTokenFromStorage)
      if (parsedUserToken.googleId && parsedUserToken.token) {
        setUserToken(parsedUserToken.token)
        getUserProfile(parsedUserToken.token)
          .then((authedUser) => {
            // console.log(authedUser)
            if (authedUser.googleId === parsedUserToken.googleId) {
              setCurrentUser(authedUser)
              if (authedUser.teams && authedUser.teams.length > 0) {
                setCurrentTeam(authedUser.teams[0])
              } else {
                setCurrentTeam(defaultTeam)
              }
            } else {
              // data is tampered with, create local user like nothing ever happened B-)
            }
          })
          .catch(() => {
            // token failed, delete local storage of user, redirect to login?
            localStorage.removeItem('userToken')
            // perhaps redirect to login here
          })
      } else {
        // add username/password logic to this, right here
      }
    } else {
      // NOW we can check for a local user.
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

  const setUser = (user: User) => {
    // delete local user if brand new and no teams yet
    if (!!localStorage.getItem('user')) {
      const userFromStorageToCheck: string | null = localStorage.getItem('user')
      if (
        typeof window !== undefined &&
        userFromStorageToCheck &&
        userFromStorageToCheck !== 'undefined'
      ) {
        const userJSONToCheck = JSON.parse(userFromStorageToCheck)
        if (userJSONToCheck.teams && userJSONToCheck.teams.length === 0) {
          localStorage.removeItem('user')
        }
      }
    }
    setCurrentUser(user)
    /* const { googleId, token } = user
    if (user.googleId && user.token) {
      localStorage.setItem('userToken', JSON.stringify({ googleId, token }))
    } */
  }

  const setLanguage = (lang: string) => {
    setLanguage1(lang)
    fetchStrings(lang)
  }

  const setTeams = (teams: any[]) => {
    const curr: User = { ...currentUser! }
    curr.teams = teams
    setCurrentUser(curr)
    if (userToken) {
      updateUserTeams(teams, userToken)
        .then(() => {
          // maybe a modal here or something
        })
        .catch(() => {
          // modal with an error
        })
    } else {
      localStorage.setItem('user', JSON.stringify(curr))
    }
  }

  const connect = () => {
    if (socket.readyState === WebSocket.OPEN) {
      return
    }

    if (!currentUser) {
      return
    }

    const id1 = currentUser?.googleId || currentUser?.displayName || uuidv4()
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
        // Authenticate
        s.onmessage = (msg: MessageEvent) => {
          if (msg.data.startsWith('$Authentication')) {
            setIsSocketAuthenticated(msg.data === '$Authentication Success')

            // Reset if it authentication fails
            if (msg.data !== '$Authentication Success') {
              setSocket({} as WebSocket)
            }
          }
        }
        s.send(
          JSON.stringify({
            type: 'AUTHENTICATION', // TODO: Change to constant
            token: getUserToken(),
          })
        )
        clearInterval(x)
      } else if (s.readyState === WebSocket.CLOSED) {
        clearInterval(x)
      }
    }, 100)
  }

  useEffect(connect, [currentUser])

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

  const clear = () => {
    if (window.confirm(strings.clear_data_confirm)) {
      localStorage.clear()
      const newUser: User = {
        displayName: uuidv4(),
        teams: [],
      }
      setCurrentUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      setCurrentTeam(defaultTeam)
      setKeys1(defaultKeys)
      alert(strings.cookies_cleared)
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
        <LanguageContext.Provider
          value={{
            languages: supportedLanguages,
            strings,
            current: mapLanguage(language),
          }}
        >
          <IdContext.Provider value={{ id, setId }}>
            <UserContext.Provider
              value={{ user: currentUser!, setUser, setTeams }}
            >
              <TeamContext.Provider value={{ team: currentTeam, setTeam }}>
                <SocketContext.Provider
                  value={{ socket, isSocketAuthenticated, connect }}
                >
                  <HistoryContext.Provider value={{ prev: prevRoute, routing }}>
                    <Component {...pageProps} />
                  </HistoryContext.Provider>
                </SocketContext.Provider>
              </TeamContext.Provider>
            </UserContext.Provider>
          </IdContext.Provider>
        </LanguageContext.Provider>
      </SettingsContext.Provider>
    </>
  )
}

export default CustomApp
