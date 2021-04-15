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

const Form: React.FunctionComponent = () => {
  const [error, setError] = useState('')
  const [room, setRoom] = useState('')
  const { socket, connect, connectAndJoin } = useContext(SocketContext)
  const team = useContext(TeamContext).team
  let teamMembers: TeamMember[]
  if (team) {
    teamMembers = team.members
  }
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  // matchmaking
  const [isMatchmaking, setIsMatchmaking] = useState(false)

  socket.onmessage = (msg: MessageEvent) => {
    if (msg.data.startsWith('$error')) {
      const data = msg.data.slice(6)
      setIsLoading(false)
      setError(data)
    } else if (msg.data.startsWith('$start')) {
      router.push(`/matchup/${room}`)
    } else if (msg.data.startsWith('$PROMT_JOIN')) {
      const roomId = msg.data.slice('$PROMT_JOIN'.length)
      joinRoom(roomId)
    }
  }

  function joinRoom(roomId?: string) {
    if (roomId) {
      setRoom(roomId)
    } else {
      roomId = room
    }

    // Connected, let's sign-up for to receive messages for this room
    const data = {
      type: CODE.room,
      payload: { room: roomId, team: teamMembers },
    }
    socket.send(JSON.stringify(data))
  }

  function join() {
    if (socket.readyState && socket.readyState === WebSocket.OPEN) {
      joinRoom()
    } else if (!isLoading) {
      if (!socket.readyState || socket.readyState === WebSocket.CLOSED) {
        const payload = { room, team: teamMembers }
        setIsLoading(true)
        connectAndJoin(uuidv4(), payload)
      }
    }
  }

  function joinQuickPlay() {
    // determine rule
    setIsMatchmaking(true)
    setIsLoading(true)
    const data = {
      type: CODE.matchmaking_search_battle,
      payload: {
        format: {
          // TODO: Different Formats
          // Also someone explain to my why this line doesn't work:
          // import { RULESET_NAMES } from '@adibkhan/pogo-web-backend/rule'
          name: 'Great',
        },
      },
    }
    connect(uuidv4(), (sock: WebSocket) => {
      sock.send(JSON.stringify(data))
    })
  }

  function quitQuickPlay() {
    const data = {
      type: CODE.matchmaking_quit,
      payload: {
        format: {
          // TODO: Different Formats
          name: 'Great',
        },
      },
    }
    socket.send(JSON.stringify(data))

    setIsMatchmaking(false)
    setIsLoading(false)
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRoom(e.target.value)
  }

  function onErrorPopupClose() {
    setError('')
  }

  return (
    <>
      {!!error && <ErrorPopup error={error} onClose={onErrorPopupClose} />}
      <section className={style.root}>
        <div className={style.container}>
          <h1>Project Grookey</h1>
          <div className={style.code}>
            Code:{' '}
            <input
              className={style.input}
              value={room}
              placeholder="Enter room code"
              onChange={onChange}
            />
          </div>
        </div>
        {isLoading ? (
          <div className={style.loading}>
            <Loader type="TailSpin" color="#68BFF5" height={40} width={40} />
            {isMatchmaking && (
              <button
                className={classnames([style.button, 'btn', 'btn-primary'])}
                onClick={quitQuickPlay}
              >
                Quit
              </button>
            )}
          </div>
        ) : (
          <>
            <button
              className={classnames([style.button, 'btn', 'btn-primary'])}
              disabled={room === ''}
              onClick={join}
            >
              Play
            </button>

            <button
              className={classnames([style.button, 'btn', 'btn-primary'])}
              onClick={joinQuickPlay}
            >
              Quick Play
            </button>

            <br />
            {/* <button onClick={getSignInWithGooglePopup}>
            Sign In With Google
          </button> */}
          </>
        )}
      </section>
    </>
  )
}

export default Form
