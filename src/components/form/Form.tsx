import { useContext, useState } from 'react'
import { useRouter } from 'next/router'
import SocketContext from '@context/SocketContext'
import style from './form.module.scss'
import TeamContext from '@context/TeamContext'
import { TeamMember, SearchBattlePayload } from '@adibkhan/pogo-web-backend'
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import { v4 as uuidv4 } from 'uuid'
import classnames from 'classnames'
// import { getSignInWithGooglePopup } from 'src/firebase'
import Loader from 'react-loader-spinner'

const Form: React.FunctionComponent = () => {
  const [room, setRoom] = useState('')
  const { socket, connect } = useContext(SocketContext)
  const team: TeamMember[] = useContext(TeamContext).team
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  // matchmaking
  const [isMatchmaking, setIsMatchmaking] = useState(false)

  // TODO: define this somewhere else, let player choose from all leagues
  const defaultRule: any = {
    name: 'open',
    maxCP: 1500,
    maxLevel: 50,
    maxBestBuddy: 1,
  }

  function joinRoom() {
    // Connected, let's sign-up for to receive messages for this room
    const data = { type: CODE.room, payload: { room, team } }
    socket.send(JSON.stringify(data))
    router.push(`/matchup/${room}`)
  }

  function join() {
    if (socket.readyState && socket.readyState === WebSocket.OPEN) {
      joinRoom()
    } else if (!isLoading) {
      if (!socket.readyState || socket.readyState === WebSocket.CLOSED) {
        const payload = { room, team }
        setIsLoading(true)
        connect(uuidv4(), payload)
      }
    }
  }

  function joinQuickPlay() {
    // determine rule
    setIsMatchmaking(true)
    setIsLoading(true)
    const data = { type: CODE.matchmaking_search_battle, payload: {} }
    socket.send(JSON.stringify(data))
  }

  function quitQuickPlay() {
    const data = { type: CODE.matchmaking_quit, payload: {} }
    socket.send(JSON.stringify(data))

    setIsMatchmaking(false)
    setIsLoading(false)
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRoom(e.target.value)
  }

  return (
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
          <button
            className={classnames([style.button, 'btn', 'btn-primary'])}
            onClick={quitQuickPlay}
            style={isMatchmaking ? { display: 'visible' } : { display: 'none' }}
          >
            Quit
          </button>
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
  )
}

export default Form
