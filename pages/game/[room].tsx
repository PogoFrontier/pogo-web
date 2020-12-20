import Status from "@components/status/Status"
import SocketContext from "@context/SocketContext"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"
import { TeamMember, ResolveTurnPayload } from "@adibkhan/pogo-web-backend"
import { CODE, Actions } from '@adibkhan/pogo-web-backend/actions'
import { Icon } from "@components/icon/Icon"
import style from './style.module.scss'
import Field from "@components/field/Field"
import { CharacterProps } from "@components/field/Character"
import Switch from "@components/switch/Switch"

interface CheckPayload {
  countdown: number
  team: TeamMember[]
  opponent: TeamMember[]
}

interface Data {
  type: keyof typeof CODE,
  payload?: CheckPayload | ResolveTurnPayload
}

const GamePage = () => {
  const router = useRouter()
  const { room } = router.query
  const ws: WebSocket = useContext(SocketContext)
  const [ active, setActive ] = useState([] as TeamMember[])
  const [ opponent, setOpponent ] = useState([] as TeamMember[])
  const [ characters, setCharacters ] = useState([{status: "idle", back: true}, {status: "idle"}] as [CharacterProps, CharacterProps])
  const [ charPointer, setCharPointer ] = useState(0)
  const [ oppPointer, setOppPointer ] = useState(0)
  const [ time, setTime ] = useState(240)
  const [ swap, setSwap ] = useState(0)
  const [ info, setInfo ] = useState(<div/>)
  const [ currentMove, setCurrentMove ] = useState("")
  const [ isStart, setIsStart ] = useState(false)

  const startGame = () => {
    setTime(240)
    setInfo(<strong>GO!</strong>)
    setIsStart(true)
  }

  const onTurn = (payload: ResolveTurnPayload) => {
    if (payload.update[0] !== null) {
      setCurrentMove(() => "")
      const hp = payload.update[0]!.hp
      const shouldReturn = payload.update[0]!.shouldReturn
      const active = payload.update[0].active
      setActive(
        prev1 => {
          setCharPointer(
            prev2 => {
              setCharacters(prev3 => {
                if (hp) {
                  prev1[prev2].current!.hp = hp
                }
                if (active !== prev2) {
                  prev3[0].char = prev1[active]
                  prev3[0].status = "prime"
                } else if (shouldReturn) {
                  prev3[0].status = "prime"
                }
                return prev3
              })
              return active
            }
          )
          return prev1
        }
      )
    }
    if (payload.update[1] !== null) {
      const hp = payload.update[1]!.hp
      const shouldReturn = payload.update[1]!.shouldReturn
      const active = payload.update[1].active
      setInfo(() => {
        setOpponent(
          prev1 => {
            setOppPointer(
              prev2 => {
                setCharacters(prev3 => {
                  if (hp) {
                    prev1[prev2].current!.hp = hp
                  }
                  if (active !== prev2) {
                    prev3[1].char = prev1[active]
                    prev3[1].status = "prime"
                  } else if (shouldReturn) {
                    prev3[1].status = "prime"
                  }
                  return prev3
                })
                return active
              }
            )
            return prev1
          }
        )
        return <div />
      })
    }
    setSwap(payload.switch)
    setTime(payload.time)
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
        prevState[0].char = payload.team[charPointer]
        return prevState
      })
    }
    if (payload.opponent !== opponent) {
      setOpponent(payload.opponent)
      setCharacters(prevState => {
        prevState[1].char = payload.opponent[oppPointer]
        return prevState
      })
    }
  }

  const onFastMove = (move: string) => {
    setOpponent(
      prev1 => {
        setOppPointer(prev2 => {
          const opp = prev1[prev2]
          setInfo(<>
            {opp.speciesName} used {move}!
          </>)
          setCharacters(prev => {
            prev[1].status = "attack"
            return prev
          })
          return prev2
        })
        return prev1;
      }
    )
  }

  const onSwitch = (index: number) => {
    setOpponent(prev => {
      if (prev[index]) {
        setInfo(<>
          Go! {prev[index].speciesName}!
        </>)
      }
      return prev
    })
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
    if (message.data.startsWith("#")) {
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
          onTurn(data.payload! as ResolveTurnPayload)
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

  const onSwitchClick = (pos: number) => {
    if (currentMove === "" && isStart && swap <= 0) {
      setCurrentMove("switch to " + pos)
      const data = "#sw:" + pos
      ws.send(data)
      setCharacters(prev => {
        prev[0].status = "switch"
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
        <Switch team={active} pointer={charPointer} countdown={swap} onClick={onSwitchClick} />
      </div>
    </main>
  )
}

export default GamePage