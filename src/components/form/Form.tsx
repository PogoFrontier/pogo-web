import { useContext, useState } from 'react'
import { useRouter } from 'next/router'
import SocketContext from '@context/SocketContext'
import style from './form.module.scss'
import TeamContext from '@context/TeamContext'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import { v4 as uuidv4 } from 'uuid'
import classnames from 'classnames'
// import { getSignInWithGooglePopup } from 'src/firebase'
import Loader from 'react-loader-spinner'
import ErrorPopup from '@components/error_popup/ErrorPopup'
import RoomModal from '@components/room_modal/RoomModal'

const Form: React.FunctionComponent = () => {
  const [error, setError] = useState('')
  const [room, setRoom] = useState('')
  const { socket, connect, connectAndJoin } = useContext(SocketContext)
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

  socket.onmessage = (msg: MessageEvent) => {
    if (msg.data.startsWith('$error')) {
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
    if (socket.readyState && socket.readyState === WebSocket.OPEN) {
      joinRoom()
    } else if (state !== 'loading') {
      if (!socket.readyState || socket.readyState === WebSocket.CLOSED) {
        const payload = { room, team: teamMembers, format: team.format }
        setState('loading')
        connectAndJoin(uuidv4(), payload)
      }
    }
  }

  function joinQuickPlay() {
    // determine rule
    if (!team.format) {
      return
    }
    setIsMatchmaking(true)
    setState('loading')
    const data = {
      type: CODE.matchmaking_search_battle,
      payload: {
        format: team.format,
      },
    }
    connect(uuidv4(), (sock: WebSocket) => {
      sock.send(JSON.stringify(data))
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
              Quit
            </button>
          )}
        </div>
      )
    }
    if (state === 'quick') {
      return (
        <>
          <button
            className={classnames([style.button, 'btn', 'btn-primary'])}
            onClick={joinQuickPlay}
          >
            Quick Play
          </button>
          <button
            className="btn btn-secondary noshrink"
            onClick={openRoomModal}
          >
            Browse Rooms
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
      <section className={style.root}>{render()}</section>
    </>
  )
}

export default Form
