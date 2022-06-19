import { FC, useEffect, useState } from 'react'
import { w3cwebsocket as WebSocket } from 'websocket'
import { setWsHeartbeat, WebSocketBase } from 'ws-heartbeat/client'
import { AppProps } from 'next/app'
import SocketContext from '@context/SocketContext'
import IdContext from '@context/IdContext'
import '@common/css/layout.scss'
import TeamContext, { defaultTeam } from '@context/TeamContext'
// import { auth } from '../src/firebase'
import UserContext, { User, UserTeam } from '@context/UserContext'
import HistoryContext from '@context/HistoryContext'
import {
  getUserProfile,
  updateUserTeams,
  updateUsername,
  isFriendRequestPossible,
  sendFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  acceptFriendRequest,
  getFriendList,
  sendUnfriend,
} from '@common/actions/userAPIActions'
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
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import FriendContext from '@context/FriendContext'
import PokemonMovesContextProvider from '../src/components/contexts/PokemonMovesContext'

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
  const [currentTeam, setCurrentTeam] = useState({} as UserTeam)
  const [id, setId] = useState('')
  const [socket, setSocket] = useState({} as WebSocket)
  const [isSocketAuthenticated, setIsSocketAuthenticated] = useState(false)
  const [keys, setKeys1] = useState(defaultKeys)
  const [showKeys, setShowKeys] = useState(isDesktop)
  const [routing, setRouting] = useState(false)
  const [prevRoute, setPrevRoute] = useState<string | null>(null)
  const [userToken, setUserToken] = useState<string | null>(null)
  const [language, setLanguage1] = useState('English')
  const [strings, setStrings] = useState<StringsType>(standardStrings)
  const [authForced, forceAuth] = useState(false)

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

  const loadUser = () => {
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
  }

  useEffect(() => {
    const savedLang: string = localStorage.getItem('language') ?? language
    setLanguage1(savedLang)
    fetchStrings(savedLang)
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

    loadUser()
  }, [])

  useEffect(() => {
    const handleRouteChange = (url: string) => {
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

  const setUsername = async (username: string) => {
    const res = await updateUsername(username, userToken)

    if (res instanceof Error) {
      throw res
    }

    setCurrentUser(res)
    localStorage.setItem('user', JSON.stringify(res))
  }

  // authenticate with user
  const authenticate = () => {
    forceAuth(false)
    const token = getUserToken()

    if (!currentUser || !token) {
      return
    }
    if (socket.readyState !== WebSocket.OPEN) {
      return
    }
    if (isSocketAuthenticated) {
      return
    }

    socket.send(
      JSON.stringify({
        type: CODE.authentication,
        token,
      })
    )
  }

  const connect = () => {
    setSocket((prev) => {
      if (prev.readyState === WebSocket.OPEN) {
        return prev
      }

      // Reset connection
      if (prev.close) {
        prev.close()
      }
      setIsSocketAuthenticated(false)

      // Create new socket
      const id1 = currentUser?.googleId || uuidv4()
      const s: any = new WebSocket(`${WSS}${id1}`)
      setId(id1)
      setWsHeartbeat(s as WebSocketBase, '{"kind":"ping"}', {
        pingInterval: 30000, // every 30 seconds, send a ping message to the server.
        pingTimeout: 60000, // in 60 seconds, if no message accepted from server, close the connection.
      })

      // Default onmessage. Register authentication responses
      s.onmessage = (msg: MessageEvent) => {
        if (msg.data.startsWith('$Authentication')) {
          const success = msg.data.startsWith('$Authentication Success')
          setIsSocketAuthenticated(success)
          if (success && msg.data.length > '$Authentication Success'.length) {
            setId(msg.data.split(': ')[1])
          }
        }
      }

      // Force an authentication when the websocket is opened
      let prevReadyState = s.readyState
      const x = setInterval(() => {
        if (prevReadyState !== s.readyState) {
          prevReadyState = s.readyState
          forceAuth(s.readyState === WebSocket.OPEN)
        }
      })

      // Setup a reconnection after the socket closes
      s.onclose = () => {
        clearInterval(x)
        // Try to reconnect every 5s
        setTimeout(connect, 5000)
        setRouting(false)
        router.push('/')
      }

      return s
    })
  }

  const updateId = () => {
    setCurrentUser((prevUser) => {
      setId((prevId) => {
        if (prevUser?.googleId) {
          prevId = prevUser.googleId
        }
        return prevId
      })
      return prevUser
    })
  }

  // Reconnect if disconnected every 5 seconds
  useEffect(connect, [])
  useEffect(authenticate, [
    socket.readyState,
    currentUser,
    isSocketAuthenticated,
    authForced,
  ])
  useEffect(updateId, [currentUser])

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
        teams: [],
      }
      setCurrentUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      setCurrentTeam(defaultTeam)
      setKeys1(defaultKeys)
      alert(strings.cookies_cleared)
    }
  }

  const isFRPossible = async (username: string) => {
    const friendResult = await isFriendRequestPossible(username, userToken)

    if (friendResult.error === 'Error: Request failed with status code 404') {
      friendResult.error = strings.user_does_not_exist_error
    } else if (
      friendResult.error === 'Error: Request failed with status code 403'
    ) {
      friendResult.error = strings.fr_duplicate_error?.replace('%1', username)
    } else if (
      friendResult.error === 'Error: Request failed with status code 409'
    ) {
      friendResult.error = strings.fr_conflict_error?.replace('%1', username)
    }

    return friendResult
  }

  const sendFR = (username: string) => {
    return sendFriendRequest(username, userToken)
  }

  const declineFR = (_id: string) => {
    return declineFriendRequest(_id, userToken)
  }

  const cancelFR = (_id: string) => {
    return cancelFriendRequest(_id, userToken)
  }

  const acceptFR = (_id: string) => {
    return acceptFriendRequest(_id, userToken)
  }

  const getFriends = () => {
    return getFriendList(userToken)
  }

  const unfriend = (_id: string) => {
    return sendUnfriend(_id, userToken)
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
      <PokemonMovesContextProvider>
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
                value={{
                  user: currentUser!,
                  setUser,
                  setTeams,
                  setUsername,
                  loadUser,
                }}
              >
                <TeamContext.Provider value={{ team: currentTeam, setTeam }}>
                  <SocketContext.Provider
                    value={{
                      socket,
                      isSocketAuthenticated,
                      setIsSocketAuthenticated,
                      connect,
                    }}
                  >
                    <HistoryContext.Provider
                      value={{ prev: prevRoute, routing }}
                    >
                      <FriendContext.Provider
                        value={{
                          isFriendRequestPossible: isFRPossible,
                          sendFriendRequest: sendFR,
                          cancelFriendRequest: cancelFR,
                          declineFriendRequest: declineFR,
                          acceptFriendRequest: acceptFR,
                          getFriends,
                          unfriend,
                        }}
                      >
                        <Component {...pageProps} />
                      </FriendContext.Provider>
                    </HistoryContext.Provider>
                  </SocketContext.Provider>
                </TeamContext.Provider>
              </UserContext.Provider>
            </IdContext.Provider>
          </LanguageContext.Provider>
        </SettingsContext.Provider>
      </PokemonMovesContextProvider>
    </>
  )
}

export default CustomApp
