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
import Popover from "@components/popover/Popover"

interface CheckPayload {
  countdown: number
  team: TeamMember[]
  opponent: TeamMember[],
  shields: number,
  remaining: number,
  oppShields: number,
  oppRemaining: number
}

interface Data {
  type: keyof typeof CODE,
  payload?: CheckPayload | ResolveTurnPayload
}

enum StatusTypes {
  STARTING,
  MAIN,
  WAITING,
  FAINT,
  CHARGE,
  ENDED
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
  const [ shields, setShields ] = useState(0)
  const [ remaining, setRemaining ] = useState(0)
  const [ oppShields, setOppShields ] = useState(0)
  const [ oppRemaining, setOppRemaining ] = useState(0)
  const [ wait, setWait ] = useState(-1)
  const [ status, setStatus ] = useState(StatusTypes.STARTING)

  const startGame = () => {
    setTime(240)
    setInfo(<strong>GO!</strong>)
    setStatus(StatusTypes.MAIN)
  }

  const endGame = () => {
    setStatus(StatusTypes.ENDED)
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
                if (payload.update[0]?.remaining) {
                  setRemaining(payload.update[0]!.remaining)
                  prev1[prev2].current!.hp = 0
                  if (active === prev2) {
                    setStatus(StatusTypes.FAINT)
                    prev3[0].status = "switch"
                  }
                }
                if (payload.update[0]?.wait) {
                  setWait(payload.update[0]!.wait)
                  if (payload.update[0]!.wait <= -1) {
                    setStatus(StatusTypes.MAIN)
                  }
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
                  if (payload.update[1]?.remaining) {
                    setOppRemaining(payload.update[1]?.remaining)
                    prev1[prev2].current!.hp = 0
                    if (active === prev2) {
                      setStatus(StatusTypes.WAITING)
                      prev3[1].status = "switch"
                    }
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
    setShields(payload.shields)
    setRemaining(payload.remaining)
    setOppShields(payload.oppShields)
    setOppRemaining(payload.oppRemaining)
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
        return prev1
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
    if (message.data === "$end") {
      endGame()
    } else if (message.data.startsWith("#")) {
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

  const toHome = () => {
    router.push("/")
  }

  useEffect(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        type: CODE.ready_game,
        payload: { room },
      }))
      ws.onmessage = onMessage
    } else {
      toHome()
    }
  }, [])

  if (active.length <= 0 || opponent.length <= 0) {
    return (<p>Loading...</p>)
  }

  const current = active[charPointer]
  const opp = opponent[oppPointer]

  const onClick = () => {
    if (currentMove === "" && status === StatusTypes.MAIN && wait <= -1) {
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
    if (currentMove === "" && status === StatusTypes.MAIN && swap <= 0 && wait <= -1) {
      setCurrentMove("switch to " + pos)
      const data = "#sw:" + pos
      ws.send(data)
      setCharacters(prev => {
        prev[0].status = "switch"
        return prev
      })
    }
  }

  const onFaintClick = (pos: number) => {
    setCurrentMove("switch to " + pos)
    const data = "#sw:" + pos
    ws.send(data)
    setCharacters(prev => {
      prev[0].status = "switch"
      return prev
    })
  }

  if (status === StatusTypes.ENDED) {
    return (
      <main>
        <h1>Game Over!</h1>
      </main>
    )
  }

  return (
    <main className={style.root}>
      <div className={style.content} onClick={onClick}>
        <section className={style.nav}>
          <button className="btn btn-negative">Exit</button>
        </section>
        <section className={style.statuses}>
          <Status subject={current} shields={shields} remaining={remaining} />
          <Status subject={opp} shields={oppShields} remaining={oppRemaining} />
        </section>
        <section className={style.info}>
          <div>{ wait > -1 ? `Switch in ${wait}` : info }</div>
          <div className={style.timer}>
            <strong>{time + " "}</strong>
            <Icon name="clock" size="medium" />
          </div>
        </section>
        <Field characters={ characters }/>
        <Switch team={active} pointer={charPointer} countdown={swap} onClick={onSwitchClick} />
        <Popover closed={wait <= -1} showMenu={status !== StatusTypes.WAITING}>
          {
            status === StatusTypes.FAINT && (
              <Switch team={active} pointer={charPointer} countdown={wait} onClick={onFaintClick} modal />
            )
          }
        </Popover>
      </div>
    </main>
  )
}

export default GamePage