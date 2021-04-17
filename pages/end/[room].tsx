import { CODE } from '@adibkhan/pogo-web-backend/actions'
import { Team } from '@adibkhan/pogo-web-backend/team'
import SocketContext from '@context/SocketContext'
import TeamContext from '@context/TeamContext'
import { useRouter } from 'next/router'
import { useState, useContext } from 'react'
import style from './style.module.scss'
import { v4 as uuidv4 } from 'uuid'
import Layout from '@components/layout/Layout'
import metaMap from '@common/actions/metaMap'

const EndPage = () => {
  const router = useRouter()
  const { room, result } = router.query
  const { socket, connectAndJoin } = useContext(SocketContext)
  const team: Team = useContext(TeamContext).team
  const [isLoading, setIsLoading] = useState(false)

  function joinRoom() {
    // Connected, let's sign-up for to receive messages for this room
    const data = {
      type: CODE.room,
      payload: {
        room,
        format: metaMap[team.format].name,
        team: team.members,
      },
    }
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
        connectAndJoin(uuidv4(), payload)
      }
    }
  }

  const toHome = () => {
    router.push('/')
  }

  return (
    <Layout>
      <div className={style.content}>
        <h1>Game over</h1>
        {(result === 'won' || result === 'lost' || result === 'tied') && (
          <h2>You {result} the game</h2>
        )}
        <div className={style.buttons}>
          <button onClick={join} className="btn btn-primary">
            Play again
          </button>
          <button onClick={toHome} className="btn btn-primary">
            Home
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default EndPage
