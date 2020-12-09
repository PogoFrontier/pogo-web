import Status from "@components/status/Status"
import SocketContext from "@context/SocketContext"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"
import { CODE } from "types/socket"
import { TeamMember } from "types/team"

enum STATUS {
  STARTING,
  STARTED,
  END
}

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
  const [ countdown, setCountdown ] = useState(-1)
  const [ status, setStatus ] = useState(STATUS.STARTING)
  const [ time, setTime ] = useState(-1)

  const startGame = () => {
    setStatus(STATUS.STARTING)
    setTime(150)
  }

  const onTurn = () => {
    setTime(prevState => prevState - 1);
  }

  const onGameStatus = (payload: CheckPayload) => {
    setCountdown(payload.countdown)
    if (payload.countdown === 4) {
      startGame()
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
    <main>
      <h1>{room}</h1>
      <section>
        <Status subject={current} shields={2} remaining={2} />
        <Status subject={opp} shields={2} remaining={2} />
      </section>
      <h2>{ status === STATUS.STARTED ? time : countdown }</h2>
    </main>
  )
}

export default GamePage