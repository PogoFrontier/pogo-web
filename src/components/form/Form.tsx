import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import SocketContext from '@context/SocketContext'
import style from './form.module.scss'
import TeamContext from '@context/TeamContext'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import classnames from 'classnames'
// import { getSignInWithGooglePopup } from 'src/firebase'
import Loader from 'react-loader-spinner'
import ErrorPopup from '@components/error_popup/ErrorPopup'
import UnauthenticatedPopup from '@components/unauthenticated_popup/UnauthenticatedPopup'
import RoomModal from '@components/room_modal/RoomModal'
import { SERVER } from '@config/index'
import axios from 'axios'
import LanguageContext from '@context/LanguageContext'
import { getValidateTeam } from '@common/actions/pokemonAPIActions'
import SettingsContext from '@context/SettingsContext'
import metaMap from '@common/actions/metaMap'

const Form: React.FunctionComponent = () => {
  const [error, setError] = useState('')
  const [room, setRoom] = useState('')
  const {
    socket,
    isSocketAuthenticated,
    setIsSocketAuthenticated,
  } = useContext(SocketContext)
  const team = useContext(TeamContext).team
  let teamMembers: TeamMember[]
  if (team) {
    teamMembers = team.members
  }
  const [state, setState] = useState<'quick' | 'loading'>('quick')
  const [showRoom, setShowRoom] = useState(false)
  const router = useRouter()
  // matchmaking
  const [isMatchmaking, setIsMatchmaking] = useState(false)
  const [showUnauthenticatedPopup, setUnauthenticatedPopup] = useState(false)
  const [offerGuestUser, setOfferGuestUser] = useState(false)

  const [count, setCount] = useState(-1)

  const strings = useContext(LanguageContext).strings
  const language = useContext(SettingsContext).language

  async function fetchCount() {
    const res = await axios.get(`${SERVER}api/room/status`)
    const resNum = res.data
    if (resNum > -1) {
      setCount(resNum)
    }
  }

  useEffect(() => {
    fetchCount()
  }, [])

  socket.onmessage = (msg: MessageEvent) => {
    if (msg.data.startsWith('$Authentication')) {
      setIsSocketAuthenticated(msg.data === '$Authentication Success')
    } else if (msg.data.startsWith('$error')) {
      const data = msg.data.slice(6)
      setState('quick')
      setError(data)
    } else if (msg.data.startsWith('$start')) {
      router.push(`/matchup/${room}`)
    } else if (msg.data.startsWith('$PROMT_JOIN')) {
      const roomId = msg.data.slice('$PROMT_JOIN'.length)
      joinRoom(roomId)
    }
  }

  async function validate(): Promise<boolean> {
    const result = await getValidateTeam(
      JSON.stringify(teamMembers),
      team.format,
      language
    )
    if (result.message) {
      setError(result.message)
      return false
    }
    return true
  }

  function joinRoom(roomId?: string) {
    if (!team.format) {
      return
    }
    if (roomId) {
      setRoom(roomId)
    } else {
      roomId = room
    }

    // Connected, let's sign-up for to receive messages for this room
    const data = {
      type: CODE.room,
      payload: {
        room: roomId,
        format: team.format,
        team: teamMembers,
      },
    }
    socket.send(JSON.stringify(data))
  }

  function join() {
    if (!isSocketAuthenticated) {
      setUnauthenticatedPopup(true)
      setOfferGuestUser(!!metaMap[team.format].unranked)
      return
    }
    validate().then((isValid) => {
      if (isValid) {
        if (socket.readyState && socket.readyState === WebSocket.OPEN) {
          joinRoom()
        } else if (state !== 'loading') {
          if (!socket.readyState || socket.readyState === WebSocket.CLOSED) {
            const payload = { room, team: teamMembers, format: team.format }
            setState('loading')
            const data = { type: CODE.room, payload }
            socket.send(JSON.stringify(data))
          }
        }
      }
    })
  }

  function joinQuickPlay() {
    // determine rule
    if (!team.format) {
      return
    }
    if (!isSocketAuthenticated) {
      setUnauthenticatedPopup(true)
      setOfferGuestUser(!!metaMap[team.format].unranked)
      return
    }

    validate().then((isValid) => {
      if (isValid) {
        setIsMatchmaking(true)
        setState('loading')
        const data = {
          type: CODE.matchmaking_search_battle,
          payload: {
            format: team.format,
          },
        }
        socket.send(JSON.stringify(data))
      }
    })
  }

  function quitQuickPlay() {
    if (!team.format) {
      return
    }
    const data = {
      type: CODE.matchmaking_quit,
      payload: {
        format: team.format,
      },
    }
    socket.send(JSON.stringify(data))

    setIsMatchmaking(false)
    setState('quick')
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRoom(e.target.value)
  }

  function openRoomModal() {
    setShowRoom(true)
  }

  function closeRoomModal() {
    setShowRoom(false)
  }

  function onErrorPopupClose() {
    setError('')
  }

  function closeUnauthenticatedPopup() {
    setUnauthenticatedPopup(false)
  }

  function render() {
    if (state === 'loading') {
      return (
        <div className={style.loading}>
          <Loader type="TailSpin" color="#68BFF5" height={30} width={30} />
          {isMatchmaking && (
            <button
              className={classnames([
                style.button,
                'btn',
                'btn-negative',
                'noshrink',
              ])}
              onClick={quitQuickPlay}
            >
              {strings.quit}
            </button>
          )}
        </div>
      )
    }
    if (state === 'quick') {
      return (
        <>
          {showUnauthenticatedPopup && (
            <UnauthenticatedPopup
              offerGuestUser={offerGuestUser}
              onClose={closeUnauthenticatedPopup}
            />
          )}
          <button
            className={classnames([style.button, 'btn', 'btn-primary'])}
            onClick={joinQuickPlay}
          >
            {strings.quick_play}
          </button>
          <button
            className="btn btn-secondary noshrink"
            onClick={openRoomModal}
          >
            {strings.browse_rooms}
          </button>
        </>
      )
    }
  }

  return (
    <>
      {showRoom && (
        <RoomModal
          onClose={closeRoomModal}
          room={room}
          join={join}
          onChange={onChange}
          isLoading={state === 'loading'}
        />
      )}
      {!!error && <ErrorPopup error={error} onClose={onErrorPopupClose} />}
      <section className={style.root}>
        {render()}
        {count > -1 && (
          <span className={style.status}>
            {count}{' '}
            {count === 1
              ? strings.players_online_sing
              : strings.players_online_plur}
          </span>
        )}
      </section>
    </>
  )
}

export default Form
