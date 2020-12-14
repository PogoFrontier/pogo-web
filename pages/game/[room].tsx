import Status from "@components/status/Status"
import SocketContext from "@context/SocketContext"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"
import { TeamMember } from "@adibkhan/pogo-web-backend"
import { CODE, Actions } from '@adibkhan/pogo-web-backend/actions'
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
  type: keyof typeof CODE,
  payload?: CheckPayload | TurnPayload
}

const GamePage = () => {
  const router = useRouter()
  const { room } = router.query
  const ws: WebSocket = useContext(SocketContext)
  const [ active, setActive ] = useState([] as TeamMember[])
  const [ opponent, setOpponent ] = useState([] as TeamMember[])
  const [ characters, setCharacters ] = useState([{}, {}] as [CharacterProps, CharacterProps])
  const [ charPointer,  ] = useState(0)
  const [ oppPointer, setOppPointer ] = useState(0)
  const [ time, setTime ] = useState(240)
  const [ info, setInfo ] = useState(<div/>)
  const [ currentMove, setCurrentMove ] = useState("")
  const [ isStart, setIsStart ] = useState(false)

  const startGame = () => {
    setTime(240)
    setInfo(<strong>GO!</strong>)
    setIsStart(true)
  }

  const onTurn = (payload: TurnPayload) => {
    setTime(payload.time)
    if (payload.update[0] !== {}) {
      setCurrentMove("")
      setCharacters(prev => {
        prev[0].status = "prime"
        return prev
      })
    }
    if (payload.update[1] !== {}) {
      setCharacters(prev => {
        prev[1].status = "prime"
        return prev
      })
    }
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
          char: payload.team[charPointer],
          status: "idle"
        }
        return prevState
      })
    }
    if (payload.opponent !== opponent) {
      setOpponent(payload.opponent)
      setCharacters(prevState => {
        prevState[1] = {
          char: payload.opponent[oppPointer],
          status: "idle"
        }
        return prevState
      })
    }
  }

  const onFastMove = (move: string) => {
    if (opponent[oppPointer]) {
      setInfo(<>
        {opponent[oppPointer].speciesName} used {move}!
      </>)
      setCharacters(prev => {
        prev[1].status = "attack"
        return prev
      })
    }
  }

  const onSwitch = (index: number) => {
    setOppPointer(index)
    setInfo(<>
      Go! {opponent[index].speciesName}!
    </>)
    setCharacters(prev => {
      prev[1].status = "switch"
      return prev
    })
  }

  const onChargeMove = (move: string) => {
    if (opponent[oppPointer]) {
      setInfo(<>
        {opponent[oppPointer].speciesName} used {move}!
      </>)
      setCharacters(prev => {
        prev[0].status = "charge"
        return prev
      })
    }
  }

  const onMessage = (message: MessageEvent) => {
    if (message.data.startsWith("#") && isStart) {
      //Expected format: "#fa:Volt Switch"
      const data: [keyof typeof Actions, string] = message.data.substring(1).split(":") as [keyof typeof Actions, string]
      switch (data[0]) {
        case Actions.FAST_ATTACK:
          onFastMove(data[1])
          break
        case Actions.CHARGE_ATTACK:
          onChargeMove(data[1])
          break
        case Actions.SWITCH:
          onSwitch(parseInt(data[1]))
          break
      }
    } else {
      const data: Data = JSON.parse(message.data)
      switch (data.type) {
        case CODE.game_check:
          onGameStatus(data.payload! as CheckPayload)
          break
        case CODE.game_start:
          startGame()
          break
        case CODE.turn:
          onTurn(data.payload! as TurnPayload)
          break
      }
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

  const current = active[charPointer]
  const opp = opponent[oppPointer]

  const onClick = () => {
    if (currentMove === "" && isStart) {
      setCurrentMove(current.fastMove)
      const data = "#fa:" + current.fastMove
      ws.send(data)
      setCharacters(prev => {
        prev[0].status = "attack"
        return prev
      })
    }
  }

  return (
    <main className={style.root}>
      <div className={style.content} onClick={onClick}>
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