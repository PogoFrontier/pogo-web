import Status from '@components/status/Status'
import SocketContext from '@context/SocketContext'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import {
  TeamMember,
  ResolveTurnPayload,
  Move,
  Room,
} from '@adibkhan/pogo-web-backend'
import { CODE, Actions } from '@adibkhan/pogo-web-backend/actions'
import { Icon } from '@components/icon/Icon'
import style from './style.module.scss'
import Field from '@components/field/Field'
import { CharacterProps } from '@components/field/Character'
import Switch from '@components/switch/Switch'
import Popover from '@components/popover/Popover'
import Charged from '@components/charged/Charged'
import axios from 'axios'
import { SERVER } from '@config/index'
import IdContext from '@context/IdContext'
import Shield from '@components/shield/Shield'
import Stepper from '@components/stepper/Stepper'

interface CheckPayload {
  countdown: number
}

interface Data {
  type: keyof typeof CODE
  payload?: CheckPayload | ResolveTurnPayload
}

enum StatusTypes {
  STARTING,
  MAIN,
  WAITING,
  FAINT,
  CHARGE,
  SHIELD,
}

const GamePage = () => {
  const router = useRouter()
  const { room } = router.query
  const ws: WebSocket = useContext(SocketContext).socket
  const id: string = useContext(IdContext).id
  const [active, setActive] = useState([] as TeamMember[])
  const [opponent, setOpponent] = useState([] as TeamMember[])
  const [characters, setCharacters] = useState([
    { status: 'idle', back: true },
    { status: 'idle' },
  ] as [CharacterProps, CharacterProps])
  const [charPointer, setCharPointer] = useState(0)
  const [oppPointer, setOppPointer] = useState(0)
  const [time, setTime] = useState(240)
  const [swap, setSwap] = useState(0)
  const [info, setInfo] = useState(<div />)
  const [currentMove, setCurrentMove] = useState('')
  const [shields, setShields] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [oppShields, setOppShields] = useState(0)
  const [oppRemaining, setOppRemaining] = useState(0)
  const [wait, setWait] = useState(-1)
  const [status, setStatus] = useState(StatusTypes.STARTING)
  const [moves, setMoves] = useState([] as Move[][])
  const [isLoading, setIsLoading] = useState(true)
  const [, setChargeMult] = useState(0.25)
  const [toShield, setToShield] = useState(false)
  const [message, setMessage] = useState("")

  const startGame = () => {
    setTime(240)
    setInfo(<strong>GO!</strong>)
    setStatus(StatusTypes.MAIN)
  }

  const endGame = () => {
    router.push(`/end/${room}`)
  }

  const onTurn = (payload: ResolveTurnPayload) => {
    if (payload.update[0] !== null) {
      setCurrentMove(() => '')
      const hp = payload.update[0]!.hp
      const shouldReturn = payload.update[0]!.shouldReturn
      const isActive = payload.update[0].active
      const energy = payload.update[0]!.energy
      const isShields = payload.update[0].shields
      setActive((prev1) => {
        setCharPointer((prev2) => {
          setCharacters((prev3) => {
            if (hp) {
              prev1[prev2].current!.hp = hp
            }
            if (energy) {
              prev1[prev2].current!.energy = energy
            }
            if (isActive !== prev2) {
              prev3[0].char = prev1[isActive]
              prev3[0].status = 'prime'
            } else if (shouldReturn) {
              prev3[0].status = 'prime'
            }
            if (isShields) {
              setShields(isShields)
            }
            if (payload.update[0]?.remaining) {
              setRemaining(payload.update[0]!.remaining)
              prev1[prev2].current!.hp = 0
              if (isActive === prev2) {
                setStatus(StatusTypes.FAINT)
                prev3[0].status = 'switch'
              }
            }
            if (payload.update[0]?.charge) {
              if (payload.update[0].charge === 1) {
                setStatus(StatusTypes.CHARGE)
              } else {
                setStatus(StatusTypes.SHIELD)
              }
            }
            return prev3
          })
          return isActive
        })
        return prev1
      })
      if (payload.update[0].message) {
        setMessage(payload.update[0].message)
        setTimeout(() => setMessage(""), 5000)
      }
      if (payload.update[0]?.wait) {
        setWait(payload.update[0]!.wait)
        if (payload.update[0]!.wait <= -1) {
          setStatus(
            prev => {
              if (
                payload.update[1]
                && payload.update[1].wait
                && payload.update[1].wait <= -1
              ) {
                if (prev === StatusTypes.CHARGE) {
                  setChargeMult(prev1 => {
                    ws.send('$c' + prev1.toString())
                    return 0.25
                  })
                } else if (prev === StatusTypes.SHIELD) {
                  setToShield(prev1 => {
                    ws.send('$s' + (prev1 ? 1 : 0).toString())
                    return false
                  }
                  )
                } else {
                  return StatusTypes.MAIN
                }
              }
              return StatusTypes.WAITING
            }
          )
        }
      }
    }
    if (payload.update[1] !== null) {
      const hp = payload.update[1]!.hp
      const shouldReturn = payload.update[1]!.shouldReturn
      const isActive = payload.update[1].active
      const isShields = payload.update[1].shields
      setInfo(() => {
        setOpponent((prev1) => {
          setOppPointer((prev2) => {
            setCharacters((prev3) => {
              if (hp) {
                prev1[prev2].current!.hp = hp
              }
              if (isActive !== prev2) {
                prev3[1].char = prev1[isActive]
                prev3[1].status = 'prime'
              } else if (shouldReturn) {
                prev3[1].status = 'prime'
              }
              if (isShields) {
                setOppShields(isShields)
              }
              if (payload.update[1]?.remaining) {
                setOppRemaining(payload.update[1]?.remaining)
                prev1[prev2].current!.hp = 0
                if (isActive === prev2) {
                  if (!payload.update[0]?.remaining) {
                    setStatus((prev4) => {
                      if (prev4 === StatusTypes.FAINT) {
                        return prev4
                      }
                      return StatusTypes.WAITING
                    })
                  }
                  prev3[1].status = 'switch'
                }
              }
              return prev3
            })
            return isActive
          })
          return prev1
        })
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
      setInfo(<>Starting: {payload.countdown}...</>)
    }
  }

  const onFastMove = (move: string) => {
    setOpponent((prev1) => {
      setOppPointer((prev2) => {
        const oppon = prev1[prev2]
        setInfo(
          <>
            {oppon.speciesName} used {move}!
          </>
        )
        setCharacters((prev) => {
          prev[1].status = 'attack'
          return prev
        })
        return prev2
      })
      return prev1
    })
  }

  const onSwitch = (index: number) => {
    setOpponent((prev) => {
      if (prev[index]) {
        setInfo(<>Go! {prev[index].speciesName}!</>)
      }
      return prev
    })
    setCharacters((prev) => {
      prev[1].status = 'switch'
      return prev
    })
  }

  const onMessage = (message: MessageEvent) => {
    if (message.data === '$end') {
      endGame()
    } else if (message.data.startsWith('#')) {
      // Expected format: "#fa:Volt Switch"
      const data: [keyof typeof Actions, string] = message.data
        .substring(1)
        .split(':') as [keyof typeof Actions, string]
      switch (data[0]) {
        case Actions.FAST_ATTACK:
          onFastMove(data[1])
          break
        case Actions.SWITCH:
          onSwitch(+data[1]) // used to be onSwitch(parseInt(data[1]))
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
    router.push('/')
  }

  const fetchRoom = () => {
    Promise.all([
      axios.get(`${SERVER}api/room/${room}`)
      .then((res) => {
        const currentRoom: Room = res.data
        const playerIndex = currentRoom.players.findIndex(x => x?.id === id)
        const player = currentRoom.players[playerIndex]
        const opponent = currentRoom.players[playerIndex === 0 ? 1 : 0]
        if (player && opponent && player.current && opponent.current) {
          setActive(player.current.team)
          setOpponent(opponent.current.team)
          setCharacters((prevState) => {
            prevState[0].char = player.current?.team[0]
            prevState[1].char = opponent.current?.team[0]
            return prevState
          })
          setShields(player.current.shields)
          setRemaining(player.current.remaining)
          setOppShields(opponent.current.shields)
          setOppRemaining(opponent.current.remaining)
        } else {
          throw new Error()
        }
      }),
      axios.get(`${SERVER}api/moves/team/${room}/${id}`)
      .then((res) => {
        const allMoves: Move[][] = res.data;
        setMoves(allMoves)
      })
    ])
    .then(
      () => {
        ws.send(
          JSON.stringify({
            type: CODE.ready_game,
            payload: { room },
          })
        )
        ws.onmessage = onMessage
        setIsLoading(false)
      }
    )
    .catch(toHome)
  }

  useEffect(() => {
    if (ws.readyState === ws.OPEN) {
      fetchRoom()
    } else {
      toHome()
    }
  }, [])

  if (isLoading) {
    return <p>Loading...</p>
  }

  const current = active[charPointer]
  const opp = opponent[oppPointer]

  const onClick = () => {
    if (currentMove === '' && status === StatusTypes.MAIN && wait <= -1) {
      setCurrentMove(current.fastMove)
      const data = '#fa:' + current.fastMove
      ws.send(data)
      setCharacters((prev) => {
        prev[0].status = 'attack'
        return prev
      })
    }
  }

  const onSwitchClick = (pos: number) => {
    if (
      currentMove === '' &&
      status === StatusTypes.MAIN &&
      swap <= 0 &&
      wait <= -1
    ) {
      setCurrentMove('switch to ' + pos)
      const data = '#sw:' + pos
      ws.send(data)
      setCharacters((prev) => {
        prev[0].status = 'switch'
        return prev
      })
    }
  }

  const onChargeClick = (move: Move) => {
    if (currentMove === ''
      && status === StatusTypes.MAIN
      && wait <= -1
      && active[charPointer].current?.energy
      && active[charPointer].current!.energy! >= move.energy
    ) {
      setCurrentMove(move.moveId)
      const data = '#ca:' + move.moveId
      ws.send(data)
    }
  }

  const onFaintClick = (pos: number) => {
    setCurrentMove('switch to ' + pos)
    const data = '#sw:' + pos
    ws.send(data)
    setCharacters((prev) => {
      prev[0].status = 'switch'
      return prev
    })
  }

  const onShield = () => {
    setToShield(true)
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
          <div>{wait > -1 ? wait : info}</div>
          <div className={style.timer}>
            <strong>{time + ' '}</strong>
            <Icon name="clock" size="medium" />
          </div>
        </section>

        <Field characters={characters} />
        <Switch
          team={active}
          pointer={charPointer}
          countdown={swap}
          onClick={onSwitchClick}
        />
        <Charged
          moves={moves[charPointer]}
          energy={current.current?.energy || 0}
          onClick={onChargeClick}
        />
        {
          message !== "" &&
          <strong className={style.message}>
            {message}
          </strong>
        }
        <Popover
          closed={status === StatusTypes.MAIN}
          showMenu={status !== StatusTypes.WAITING
            && status !== StatusTypes.STARTING
          }
        >
          {status === StatusTypes.FAINT && (
            <Switch
              team={active}
              pointer={charPointer}
              countdown={wait}
              onClick={onFaintClick}
              modal={true}
            />
          )}
          {status === StatusTypes.CHARGE && (
            <Stepper onStep={setChargeMult} />
          )}
          {status === StatusTypes.SHIELD && (
            <Shield value={toShield} onShield={onShield} shields={shields} />
          )}
        </Popover>
      </div>
    </main>
  )
}

export default GamePage
