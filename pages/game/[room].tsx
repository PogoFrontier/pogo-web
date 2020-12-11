import Status from "@components/status/Status"
import SocketContext from "@context/SocketContext"
//import TeamContext from "@context/TeamContext"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"
import { CODE } from "types/socket"
import { TeamMember } from "types/team"
import { Icon } from "@components/icon/Icon"
import style from './style.module.scss'

interface CheckPayload {
  countdown: number
  team: TeamMember[]
  opponent: TeamMember[]
}

interface TurnPayload {
  
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
  const [ time, setTime ] = useState(150)
  const [ info, setInfo ] = useState(<div/>)

  const startGame = () => {
    setTime(150)
  }

  const onTurn = () => {
    setTime(prevState => prevState - 1);
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
    }
    if (payload.opponent !== opponent) {
      setOpponent(payload.opponent)
    }
  }

  const onMessage = (message: MessageEvent) => {
    const data: Data = JSON.parse(message.data)
    switch (data.type) {
      case CODE.game_check || CODE.game_start:
        onGameStatus(data.payload! as CheckPayload)
        break;
      case CODE.turn:
        onTurn();
        break;
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
  // const team = useContext(TeamContext)
  // const current = team[0]
  // const opp = team[0]

  return (
    <main className={style.root}>
      <div className={style.content}>
        <section className={style.statuses}>
          <Status subject={current} shields={2} remaining={2} />
          <Status subject={opp} shields={2} remaining={2} />
        </section>
        <section className={style.info}>
          <button className="btn btn-negative">Exit</button>
          <div>{ info }</div>
          <div className={style.timer}>
            <strong>{time + " "}</strong>
            <Icon name="clock" size="medium" />
          </div>
        </section>
      </div>
    </main>
  )
}

export default GamePage