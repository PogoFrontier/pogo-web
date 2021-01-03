import { useContext, useState } from 'react'
import { useRouter } from 'next/router'
import SocketContext from '@context/SocketContext'
import style from './form.module.scss'
import TeamContext from '@context/TeamContext'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import classnames from 'classnames'

const Form: React.FunctionComponent = () => {
  const [room, setRoom] = useState('')
  const ws: WebSocket = useContext(SocketContext)
  const team: TeamMember[] = useContext(TeamContext)
  const router = useRouter()

  function connect() {
    if (ws.OPEN) {
      // Connected, let's sign-up for to receive messages for this room
      const data = { type: CODE.room, payload: { room, team } }
      ws.send(JSON.stringify(data))
      router.push(`/matchup/${room}`)
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
      <button
        className={classnames([style.button, 'btn', 'btn-primary'])}
        disabled={room === ''}
        onClick={connect}
      >
        Play
      </button>
    </section>
  )
}

export default Form
