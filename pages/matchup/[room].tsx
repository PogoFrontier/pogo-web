import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import SocketContext from '@context/SocketContext'
import TeamContext from '@context/TeamContext'
import Team from '@components/team/Team'
import Select from '@components/select/Select'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import style from './style.module.scss'
import useWindowSize from '@common/actions/useWindowSize'
import Loader from 'react-loader-spinner'

enum STATUS {
  CHOOSING,
  WAITING,
}

interface Payload {
  team?: TeamMember[]
}

interface Data {
  type: keyof typeof CODE
  payload?: Payload
}

const MatchupPage = () => {
  const router = useRouter()
  const [opponentTeam, setOpponentTeam] = useState([] as TeamMember[])
  const [status, setStatus] = useState(STATUS.CHOOSING)
  const { room } = router.query
  const ws: WebSocket = useContext(SocketContext).socket
  const team: TeamMember[] = useContext(TeamContext).team
  const { height } = useWindowSize()

  const onMessage = (message: MessageEvent) => {
    const data: Data = JSON.parse(message.data)
    switch (data.type) {
      case CODE.room_join:
        setOpponentTeam(data.payload!.team!)
        break
      case CODE.room_leave:
        setOpponentTeam([])
        break
      case CODE.team_confirm:
        toGame()
        break
    }
  }

  useEffect(() => {
    if (ws.readyState === ws.OPEN && ws.send) {
      ws.send(
        JSON.stringify({
          type: CODE.get_opponent,
          payload: {
            room,
          },
        })
      )
      ws.onmessage = onMessage
    } else {
      toHome()
    }
    return function cleanup() {
      ws.onmessage = null
    }
  }, [])

  const onSubmit = (values: number[]) => {
    const submission: TeamMember[] = []
    for (const value of values) {
      submission.push(team[value])
    }
    ws.send(
      JSON.stringify({
        type: CODE.team_submit,
        payload: {
          room,
          team: submission,
        },
      })
    )
    setStatus(STATUS.WAITING)
  }

  const toHome = () => {
    ws.close()
    router.push('/')
  }

  const toGame = () => {
    router.push(`/game/${room}`)
  }

  return (
    <main className={style.root} style={{ height }}>
      <div className={style.content}>
        <header className={style.head}>
          <h1>
            Room Code: <strong>{room}</strong>
          </h1>
          <button className="btn btn-negative" onClick={toHome}>
            Exit
          </button>
        </header>
        <div className={style.teams}>
          {opponentTeam.length > 0 && (
            <div className={style.opponent}>
              <Team team={opponentTeam} />
            </div>
          )}
          <div className={style.player}>
            <Team team={team} isPlayer={true} />
          </div>
        </div>
        {status === STATUS.CHOOSING && (
          <Select team={team} onSubmit={onSubmit} />
        )}
        {status === STATUS.WAITING && (
          <div>
            <p>Waiting for opponent...</p>
            <Loader
              type="TailSpin"
              color="#68BFF5"
              height={80}
              width={80}
            />{' '}
          </div>
        )}
      </div>
    </main>
  )
}

export default MatchupPage
