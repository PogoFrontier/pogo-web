import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import classnames from 'classnames'
import SocketContext from '@context/SocketContext'
import TeamContext from '@context/TeamContext'
import HistoryContext from '@context/HistoryContext'
import Team from '@components/team/Team'
import Select from '@components/select/Select'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import style from './style.module.scss'
import useWindowSize from '@common/actions/useWindowSize'
import Loader from 'react-loader-spinner'
import LanguageContext from '@context/LanguageContext'

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
  const team: TeamMember[] = useContext(TeamContext).team.members
  const { height } = useWindowSize()
  const { routing, prev } = useContext(HistoryContext)
  const [timerStarted, setTimerStarted] = useState(false)
  const [counter, setCounter] = useState(90)

  // Third Attempts
  useEffect(() => {
    if (timerStarted && counter > 0) {
      const timer = setInterval(() => setCounter(counter - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [timerStarted, counter])

  const strings = useContext(LanguageContext).strings

  const onMessage = (message: MessageEvent) => {
    if (message.data.startsWith('$end')) {
      const result = message.data.slice(4)
      endGame(result)
      return
    }
    const data: Data = JSON.parse(message.data)
    switch (data.type) {
      case CODE.room_join:
        setOpponentTeam(data.payload!.team!)
        break
      case CODE.start_timer:
        setTimerStarted(true)
        break
      case CODE.room_leave:
        setStatus(STATUS.CHOOSING)
        setOpponentTeam([])
        break
      case CODE.team_confirm:
        toGame()
        break
    }
  }

  useEffect(() => {
    if (ws.readyState === ws.OPEN && ws.send) {
      if (!routing) {
        ws.send(
          JSON.stringify({
            type: CODE.get_opponent,
            payload: {
              room,
            },
          })
        )
      }
      ws.onmessage = onMessage
    } else {
      toHome()
    }
    return function cleanup() {
      ws.onmessage = null
    }
  }, [routing, prev])

  const onSubmit = (values: number[]) => {
    ws.send(
      JSON.stringify({
        type: CODE.team_submit,
        payload: {
          room,
          indexes: values,
        },
      })
    )
    setStatus(STATUS.WAITING)
  }

  const toHome = () => {
    router.push('/')
  }

  const forfeit = () => {
    ws.send('forfeit')
  }

  const toGame = () => {
    router.push(`/game/${room}`)
  }

  const endGame = (result: string) => {
    router.push(`/end/${room}?result=${result}`)
  }

  const startTimer = () => {
    ws.send(
      JSON.stringify({
        type: CODE.start_timer,
      })
    )
  }

  return (
    <main className={style.root} style={{ height }}>
      <div className={style.content}>
        <header className={style.head}>
          <h1>
            {strings.room_code} <strong>{room}</strong>
          </h1>
          <button className="btn btn-negative" onClick={forfeit}>
            {strings.exit}
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
        {status === STATUS.CHOOSING &&
          (opponentTeam.length > 0 ? (
            <Select team={team} onSubmit={onSubmit} />
          ) : (
            <p>{strings.waiting_for_player}</p>
          ))}
        {timerStarted || (
          <button
            className={classnames([style.submit, 'btn', 'btn-primary'])}
            onClick={startTimer}
            disabled={false}
          >
            Start timer
          </button>
        )}
        {timerStarted && <div>{counter}</div>}
        {status === STATUS.WAITING && (
          <div>
            <p>{strings.waiting_for_opponent}</p>
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
