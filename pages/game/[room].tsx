import Status from "@components/status/Status"
import SocketContext from "@context/SocketContext"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"
import { CODE } from "types/socket"
import { TeamMember } from "types/team"
import { Icon } from "@components/icon/Icon"
import style from './style.module.scss'
import Field from "@components/field/Field"
import { CharacterProps } from "@components/field/Character"

interface CheckPayload {
  countdown: number
  team: TeamMember[]
  opponent: TeamMember[]
}

interface Update {
  switch?: number
  hp?: number
  def?: number
  atk?: number
  status?: number
}

interface TurnPayload {
  time: number
  update: [Update, Update]
}

interface Data {
  type: CODE,
  payload?: CheckPayload | TurnPayload
}

const GamePage = () => {
  const router = useRouter()
  const { room } = router.query
  const ws: WebSocket = useContext(SocketContext)
  const [ active, setActive ] = useState([] as TeamMember[])
  const [ opponent, setOpponent ] = useState([] as TeamMember[])
  const [ characters, setCharacters ] = useState([{}, {}] as [CharacterProps, CharacterProps])
  const [ time, setTime ] = useState(240)
  const [ info, setInfo ] = useState(<div/>)

  const startGame = () => {
    setTime(240)
    setInfo(<strong>GO!</strong>)
  }

  const onTurn = (payload: TurnPayload) => {
    setTime(payload.time);
  }

  const onGameStatus = (payload: CheckPayload) => {
    if (payload.countdown === 4) {
      startGame()
    } else {
      setInfo(
        <>Starting: {payload.countdown}...</>
      )
    }
    if (payload.team !== active) {
      setActive(payload.team)
      setCharacters(prevState => {
        prevState[0] = {
          char: payload.team[0],
          status: "idle"
        }
        return prevState
      })
    }
    if (payload.opponent !== opponent) {
      setOpponent(payload.opponent)
      setCharacters(prevState => {
        prevState[1] = {
          char: payload.opponent[0],
          status: "idle"
        }
        return prevState
      })
    }
  }

  const onMessage = (message: MessageEvent) => {
    const data: Data = JSON.parse(message.data)
    switch (data.type) {
      case CODE.game_check:
        onGameStatus(data.payload! as CheckPayload)
        break
      case CODE.game_start:
        startGame()
        break
      case CODE.turn:
        onTurn(data.payload! as TurnPayload);
        break
    }
  }

  useEffect(() => {
    ws.send(JSON.stringify({
      type: CODE.ready_game,
      payload: { room },
    }))
    ws.onmessage = onMessage
  }, [])

  if (active.length <= 0 || opponent.length <= 0) {
    return (<p>Loading...</p>)
  }

  const current = active[0]
  const opp = opponent[0]

  return (
    <main className={style.root}>
      <div className={style.content}>
        <section className={style.nav}>
          <button className="btn btn-negative">Exit</button>
        </section>
        <section className={style.statuses}>
          <Status subject={current} shields={2} remaining={2} />
          <Status subject={opp} shields={2} remaining={2} />
        </section>
        <section className={style.info}>
          <div>{ info }</div>
          <div className={style.timer}>
            <strong>{time + " "}</strong>
            <Icon name="clock" size="medium" />
          </div>
        </section>
        <Field characters={ characters }/>
      </div>
    </main>
  )
}

export default GamePage