import { CODE } from '@adibkhan/pogo-web-backend/actions'
import { Team } from '@adibkhan/pogo-web-backend/team'
import SocketContext from '@context/SocketContext'
import TeamContext from '@context/TeamContext'
import { useRouter } from 'next/router'
import { useState, useContext } from 'react'
import style from './style.module.scss'
import Layout from '@components/layout/Layout'
import LanguageContext from '@context/LanguageContext'
import { getValidateTeam } from '@common/actions/pokemonAPIActions'
import GameEndContext from '@context/GameEndContext'

const EndPage = () => {
  const router = useRouter()
  const { room } = router.query
  const { socket } = useContext(SocketContext)
  const team: Team = useContext(TeamContext).team
  const [isLoading, setIsLoading] = useState(false)
  const { strings, current: language } = useContext(LanguageContext)
  const { result } = useContext(GameEndContext)

  async function validate(): Promise<boolean> {
    const r = await getValidateTeam(
      JSON.stringify(team.members),
      team.format,
      language
    )
    if (r.message) {
      alert(r.message)
      return false
    }
    return true
  }

  function joinRoom() {
    // Connected, let's sign-up for to receive messages for this room
    const data = {
      type: CODE.room,
      payload: {
        room,
        format: team.format,
        team: team.members,
      },
    }
    socket.send(JSON.stringify(data))
    router.push(`/matchup/${room}`)
  }

  function join() {
    validate().then((isValid) => {
      if (isValid) {
        if (socket.readyState && socket.readyState === WebSocket.OPEN) {
          joinRoom()
        } else if (!isLoading) {
          if (!socket.readyState || socket.readyState === WebSocket.CLOSED) {
            const payload = { room, team: team.members }
            setIsLoading(true)
            const data = { type: CODE.room, payload }
            socket.send(JSON.stringify(data))
          }
        }
      }
    })
  }

  const toHome = () => {
    router.push('/')
  }

  const getResult = () => {
    switch (result) {
      case 'won':
        return strings.result_win
      case 'lost':
        return strings.result_loss
      case 'tied':
        return strings.result_tie
      default:
        break;
    }
  }

  return (
    <Layout>
      <div className={style.content}>
        <h1>{strings.game_over}</h1>
        {(result === 'won' || result === 'lost' || result === 'tied') && (
          <h2>{getResult()}</h2>
        )}
        <div className={style.buttons}>
          <button onClick={join} className="btn btn-primary">
            {strings.play_again}
          </button>
          <button onClick={toHome} className="btn btn-primary">
            {strings.homepage}
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default EndPage
