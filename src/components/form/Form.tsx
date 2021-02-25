import { useContext, useState } from 'react'
import { useRouter } from 'next/router'
import SocketContext from '@context/SocketContext'
import style from './form.module.scss'
import TeamContext from '@context/TeamContext'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import { v4 as uuidv4 } from 'uuid'
import classnames from 'classnames'
import { getSignInWithGooglePopup } from 'src/firebase'
import Loader from 'react-loader-spinner'

const Form: React.FunctionComponent = () => {
  const [room, setRoom] = useState('')
  const { socket, connect } = useContext(SocketContext)
  const team: TeamMember[] = useContext(TeamContext).team
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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
            placeholder="Room Name"
            onChange={onChange}
          />
        </div>
      </div>
      {isLoading ? (
        <Loader type="TailSpin" color="#68BFF5" height={40} width={40} />
      ) : (
        <>
          <button
            className={classnames([style.button, 'btn', 'btn-primary'])}
            disabled={room === ''}
            onClick={join}
          >
            Play
          </button>
          <br />
          <button onClick={getSignInWithGooglePopup}>
            Sign In With Google
          </button>
        </>
      )}
    </section>
  )
}

export default Form
