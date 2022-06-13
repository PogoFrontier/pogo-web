import {
  Anim,
  Move,
  ResolveTurnPayload,
  Room,
  TeamMember,
} from '@adibkhan/pogo-web-backend'
import { Actions, CODE } from '@adibkhan/pogo-web-backend/actions'
import {
  Message,
  MessageSubsitution,
} from '@adibkhan/pogo-web-backend/handlers'
import getKeyDescription from '@common/actions/getKeyDescription'
import { getPokemonNames } from '@common/actions/pokemonAPIActions'
import useKeyPress from '@common/actions/useKeyPress'
import useWindowSize from '@common/actions/useWindowSize'
import { useMoves } from '@components/contexts/PokemonMovesContext'
import Charged from '@components/game/charged/Charged'
import { CharacterProps } from '@components/game/field/Character'
import Field from '@components/game/field/Field'
import Popover from '@components/game/popover/Popover'
import Shield from '@components/game/shield/Shield'
import Status from '@components/game/status/Status'
import Stepper from '@components/game/stepper/Stepper'
import Switch from '@components/game/switch/Switch'
import { Icon } from '@components/icon/Icon'
import { SERVER } from '@config/index'
import IdContext from '@context/IdContext'
import LanguageContext from '@context/LanguageContext'
import SettingsContext from '@context/SettingsContext'
import SocketContext from '@context/SocketContext'
import axios from 'axios'
import { useRouter } from 'next/router'
import {
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import ReactDOM from 'react-dom'
import Loader from 'react-loader-spinner'
import style from './style.module.scss'

interface CheckPayload {
  countdown: number
}

interface InitPayload {
  allMoves: Move[][]
  current: TeamMember[]
}

interface Data {
  type: keyof typeof CODE
  payload?: CheckPayload | ResolveTurnPayload | InitPayload
}

enum StatusTypes {
  STARTING,
  MAIN,
  WAITING,
  FAINT,
  CHARGE,
  SHIELD,
  ANIMATING,
}

type ClickEffectProps = { x: number; y: number }

type PokemonNamesType = {
  [speciesId: string]: { speciesName: string }
}

const addClickDiv = (e: ClickEffectProps) => {
  const clickDiv: HTMLDivElement = document.createElement('div')
  clickDiv.classList.add(style.clickEffect)
  clickDiv.style.setProperty('--top', (e.y - 50).toString())
  clickDiv.style.setProperty('--left', (e.x - 50).toString())
  document.body.appendChild(clickDiv)
  clickDiv.addEventListener('animationend', (_) => {
    clickDiv?.parentElement?.removeChild(clickDiv)
  })
}

const addClickFromRef = (elem: RefObject<HTMLElement>) => {
  const buttonPosition = elem.current?.getBoundingClientRect()
  if (buttonPosition) {
    addClickDiv({
      x: buttonPosition.x + buttonPosition.width / 2,
      y: buttonPosition?.y + buttonPosition?.height / 2,
    })
  } else {
    addClickDiv({ x: window.screen.width / 2, y: window.screen.height / 2 })
  }
}

const GamePage = () => {
  const router = useRouter()
  const { room } = router.query
  const ws: WebSocket = useContext(SocketContext).socket
  const id: string = useContext(IdContext).id
  const { showKeys, keys, language } = useContext(SettingsContext)
  const {
    fastKey,
    charge1Key,
    charge2Key,
    switch1Key,
    switch2Key,
    shieldKey,
  } = keys
  const { height } = useWindowSize()
  const [active, setActive] = useState([] as TeamMember[])
  const [opponent, setOpponent] = useState([] as TeamMember[])
  const [characters, setCharacters] = useState([{ back: true }, {}] as [
    CharacterProps,
    CharacterProps
  ])
  const [charPointer, setCharPointer] = useState(0)
  const [time, setTime] = useState(240)
  const [swap, setSwap] = useState(0)
  const [currentMove, setCurrentMove] = useState('')
  const [bufferedMove, setBufferedMove] = useState('')
  const [shields, setShields] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [oppShields, setOppShields] = useState(0)
  const [oppRemaining, setOppRemaining] = useState(0)
  const [wait, setWait] = useState(-1)
  const [status, setStatus] = useState(StatusTypes.STARTING)
  const [moves, setMoves] = useState([] as Move[][])
  const [isLoading, setIsLoading] = useState(true)
  const [chargeMult, setChargeMult] = useState(0.25)
  const [toShield, setToShield] = useState(false)

  const [pokemonNames, setPokemonNames] = useState<PokemonNamesType>()

  useEffect(() => {
    ;(async () => {
      const names = await getPokemonNames(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        language
      )
      setPokemonNames(names)
    })()
  }, [])

  const toTitleCase = (text: string) => {
    return text
      .toLowerCase()
      .split('_')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ')
  }

  const translateMessage = (input: string | Message[]) => {
    if (typeof input === 'string') {
      return input
    }

    let translatedMessage = ''
    input.forEach((messageToSubstitute: Message, index) => {
      if (index !== 0) {
        translatedMessage += ' '
      }
      let translation = strings[messageToSubstitute.messageKey]
      messageToSubstitute.substitutions.forEach(
        (sub: MessageSubsitution, subIndex) => {
          const needle = '%' + (subIndex + 1)
          let replacement = sub.id
          switch (sub.type) {
            case 'moveId':
              replacement =
                movesObj?.[replacement]?.name?.[currentLanguage] ||
                movesObj?.[replacement]?.name?.en ||
                toTitleCase(replacement)
              break
            case 'speciesId':
              replacement =
                pokemonNames?.[replacement]?.speciesName ||
                toTitleCase(replacement)
              break
          }
          translation = translation.replace(needle, replacement)
        }
      )
      translatedMessage += translation
    })
    return translatedMessage
  }

  const { strings, current: currentLanguage } = useContext(LanguageContext)
  const [movesObj] = useMoves() || []

  // to use the translateMessage function that rely on pokemonNames i had to change
  // this bit of code. Basically given that we add onTurn as event handler for ws before
  // the call that sets pokemonNames is finished the latter is always undefined inside that
  // function. To avoid this i've changed message to be an useMemo that have a dependency
  // on messageToTranslate (that is what is being set by setMessage). Basically calling setMessage
  // will trigger a change in useMemo that will check if it's a string or an Array of Message and
  // call the updated translateMessage function.
  const [messageToTranslate, setMessage] = useState<string | Message[]>('')
  const message = useMemo(() => {
    if (typeof messageToTranslate === 'string') return messageToTranslate
    return translateMessage(messageToTranslate)
  }, [messageToTranslate, pokemonNames, strings, movesObj])

  const initGame = (payload: InitPayload) => {
    ReactDOM.unstable_batchedUpdates(() => {
      setMoves(payload.allMoves)
      setActive(payload.current)
    })
  }

  const startGame = () => {
    setTime(240)
    setMessage(strings.battle_start)
    setStatus(StatusTypes.MAIN)
  }

  const endGame = (result: string, data: string) => {
    router.push(`/end/${room}?result=${result}&data=${data}`)
  }

  const onTurn = (payload: ResolveTurnPayload) => {
    ReactDOM.unstable_batchedUpdates(() => {
      if (payload.update[0] !== null && payload.update[0].id === id) {
        const hp = payload.update[0]!.hp
        const isActive = payload.update[0].active
        const energy = payload.update[0]!.energy
        const isShields = payload.update[0].shields
        setActive((prev1) => {
          setCharPointer((prev2) => {
            setCharacters((prev3b) => {
              const prev3 = { ...prev3b }
              if (hp !== undefined) {
                prev1[isActive].current!.hp = hp
              }
              if (energy) {
                prev1[isActive].current!.energy = energy
              }
              prev3[0].char = prev1[isActive]
              if (isActive !== prev2 && prev3[0].anim?.type === 'faint') {
                delete prev3[0].anim
              }
              if (isShields) {
                setShields(isShields)
              }
              if (payload.update[0]?.remaining !== undefined) {
                setRemaining(payload.update[0]!.remaining)
                prev1[isActive].current!.hp = 0
                if (isActive === prev2) {
                  setTimeout((_) => setStatus(StatusTypes.FAINT), 3000)
                  prev3[0].anim = {
                    type: 'faint',
                    turn: payload.turn,
                  }
                }
              }
              if (payload.update[0]?.charge) {
                if (payload.update[0].charge === 1) {
                  setStatus(StatusTypes.CHARGE)
                } else {
                  setStatus(StatusTypes.ANIMATING)
                  setTimeout((_) => {
                    setStatus(StatusTypes.SHIELD)
                  }, 1000)
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
        }
        if (payload.update[0]?.wait) {
          setWait(payload.update[0]!.wait)
          if (payload.update[0]!.wait <= -1) {
            setStatus((prev) => {
              if (
                payload.update[1] &&
                payload.update[1].wait &&
                payload.update[1].wait <= -1
              ) {
                if (prev === StatusTypes.CHARGE) {
                  setChargeMult(0.25)
                  setTimeout(() => {
                    setStatus((currentStatus) => {
                      if (currentStatus === StatusTypes.ANIMATING) {
                        return StatusTypes.MAIN
                      }
                      return currentStatus
                    })
                  }, 3500)
                  return StatusTypes.ANIMATING
                } else if (prev === StatusTypes.SHIELD) {
                  setToShield(false)
                  setTimeout(() => {
                    setStatus((currentStatus) => {
                      if (currentStatus === StatusTypes.ANIMATING) {
                        return StatusTypes.MAIN
                      }
                      return currentStatus
                    })
                  }, 3500)
                  return StatusTypes.ANIMATING
                }
              }
              return [StatusTypes.CHARGE, StatusTypes.SHIELD].includes(prev)
                ? prev
                : StatusTypes.MAIN
            })
          }
        }
      }
      if (payload.update[1] !== null) {
        const hp = payload.update[1]!.hp
        const isShields = payload.update[1].shields
        setOpponent((prev1) => {
          setCharacters((prev3b) => {
            const prev3 = { ...prev3b }
            if (hp !== undefined) {
              prev1[0].current!.hp = hp
            }
            if (isShields !== undefined) {
              setOppShields(isShields)
            }
            if (payload.update[1]?.remaining !== undefined) {
              setOppRemaining((prevOppRemaining) => {
                if (prevOppRemaining !== payload.update[1]!.remaining) {
                  prev3[1].anim = {
                    type: 'faint',
                    turn: payload.turn,
                  }
                }
                return payload.update[1]?.remaining!
              })
              prev1[0].current!.hp = 0
              if (!payload.update[0]?.remaining) {
                setStatus((prev4) => {
                  if (prev4 === StatusTypes.FAINT) {
                    return prev4
                  }
                  return StatusTypes.WAITING
                })
              }
            }
            return prev3
          })
          return prev1
        })
      }
      setSwap(payload.switch)
      setTime(Math.max(payload.time, 0))
    })
  }

  // Send updates to charge moev decisions
  useEffect(() => {
    ws.send('$c' + chargeMult.toString())
  }, [chargeMult, status === StatusTypes.CHARGE])
  useEffect(() => {
    ws.send('$s' + (toShield ? 1 : 0).toString())
  }, [toShield])

  // Reset moves between phases
  useEffect(() => {
    setCurrentMove('')
    setBufferedMove('')
  }, [
    [
      StatusTypes.CHARGE,
      StatusTypes.FAINT,
      StatusTypes.SHIELD,
      StatusTypes.WAITING,
    ].includes(status),
  ])

  const onGameStatus = (payload: CheckPayload) => {
    if (payload.countdown === 4) {
      startGame()
    } else {
      setMessage(
        strings.battle_start_countdown.replace('%1', String(payload.countdown))
      )
    }
  }

  const onFastMove = (data: Anim) => {
    setCharacters((prev) => {
      prev[1].anim = data
      return prev
    })
  }

  const hasEnoughEnergy = (
    member: TeamMember,
    memberIndex: number,
    prevMoves: Move[][],
    ca: string
  ): boolean => {
    const [, indexString] = ca.split(':')
    return (
      member.current!.energy >=
      prevMoves[memberIndex][parseInt(indexString, 10) + 1].energy
    )
  }

  const nextCurrentMove = () => {
    setCurrentMove(() => {
      let p = ''
      setBufferedMove((prev) => {
        p = prev
        return ''
      })
      if (p.startsWith('#sw')) {
        setCharacters((prevCharacters) => {
          prevCharacters[0].anim = {
            type: Actions.SWITCH,
          }
          return prevCharacters
        })
      }
      // Visualize a buffered quick move
      if (
        p.startsWith('#fa') ||
        (p.startsWith('#ca') &&
          !hasEnoughEnergy(active[charPointer], charPointer, moves, p))
      ) {
        setCharacters((prevCharacters) => {
          prevCharacters[0].anim = {
            move: moves[charPointer][0],
            type: Actions.FAST_ATTACK,
          }
          return prevCharacters
        })
        setTimeout(nextCurrentMove, moves[charPointer][0].cooldown)
      } else if (p.startsWith('#sw')) {
        setCharacters((prev) => {
          prev[0].anim = {
            type: Actions.SWITCH,
          }
          return prev
        })
        setTimeout(nextCurrentMove, 500)
      }
      return p
    })
  }

  const onSwitch = (data: TeamMember) => {
    setOpponent((prev1) => {
      const newPrev1 = [...prev1]
      newPrev1[0] = data
      setCharacters((prev) => {
        prev[1].char = data
        prev[1].anim = {
          type: Actions.SWITCH,
        }
        return prev
      })
      return newPrev1
    })
  }

  const onMessage = (msg: MessageEvent) => {
    if (msg.data.startsWith('$end')) {
      const [result, data] = msg.data.slice(4).split('|')
      endGame(result, data)
    } else if (msg.data.startsWith('#')) {
      // Expected format: "#fa:Volt Switch"
      const data = msg.data.slice(1)
      const action: keyof typeof Actions = data.split(':', 1)[0]
      const payload = data.slice(action.length + 1)
      switch (action) {
        case Actions.FAST_ATTACK:
          onFastMove(JSON.parse(payload))
          break
        case Actions.SWITCH:
          onSwitch(JSON.parse(payload))
          break
      }
    } else {
      const data: Data = JSON.parse(msg.data)
      switch (data.type) {
        case CODE.game_check:
          onGameStatus(data.payload! as CheckPayload)
          break
        case CODE.game_start:
          initGame(data.payload! as InitPayload)
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

  const fetchRoom = async () => {
    // Get room data from api
    const res = await axios.get(`${SERVER}api/room/data/${room}`)
    const currentRoom: Room = res.data
    const playerIndex = currentRoom.players.findIndex((x) => x?.id === id)
    const player = currentRoom.players[playerIndex]
    const oppon = currentRoom.players[playerIndex === 0 ? 1 : 0]

    // A player is missing. Go back.
    if (!player?.current || !oppon?.current) {
      toHome()
      return
    }

    // Use hooks to set data
    setActive(player.current.team as TeamMember[])
    setOpponent(oppon.current.team as TeamMember[])
    setCharacters((prevState) => {
      prevState[0].char = player.current?.team[0]
      prevState[1].char = oppon.current?.team[0]
      return prevState
    })
    setShields(player.current.shields)
    setRemaining(player.current.remaining)
    setOppShields(oppon.current.shields)
    setOppRemaining(oppon.current.remaining)

    // Notify server that this client is ready
    ws.send(
      JSON.stringify({
        type: CODE.ready_game,
        payload: { room },
      })
    )
    ws.onmessage = onMessage
    setIsLoading(false)
  }

  const pressSpaceRef = useRef<HTMLLabelElement>(null)
  const chargeOneRef = useRef<HTMLButtonElement>(null)
  const chargeTwoRef = useRef<HTMLButtonElement>(null)

  const onClick = (e?: React.MouseEvent) => {
    if (e) {
      addClickDiv({ x: e.clientX, y: e.clientY })
    }

    // If you can't use a fast move, don't do anything
    if (
      status !== StatusTypes.MAIN ||
      !active[charPointer].current?.hp ||
      wait >= 0 ||
      currentMove ||
      bufferedMove
    ) {
      return false
    }

    if (!e) {
      addClickFromRef(pressSpaceRef)
    }

    // Send fast move command to server
    const data = '#fa:'
    setCurrentMove(data)
    ws.send(data)

    // Set own pokemon in motion
    setCharacters((prev) => {
      prev[0].anim = {
        move: moves[charPointer][0],
        type: Actions.FAST_ATTACK,
      }
      return prev
    })
    setTimeout(() => {
      nextCurrentMove()
    }, moves[charPointer][0].cooldown)

    return true
  }

  const onSwitchClick = (pos: number) => {
    const data = '#sw:' + pos

    ws.send(data)
    if (
      (status === StatusTypes.FAINT || status === StatusTypes.WAITING) &&
      active[pos].current?.hp &&
      active[pos].current!.hp > 0
    ) {
      setCharacters((prev) => {
        prev[0].anim = {
          type: Actions.SWITCH,
        }
        return prev
      })
    } else if (
      status === StatusTypes.MAIN &&
      swap <= 0 &&
      wait <= -1 &&
      active[pos]?.current?.hp &&
      active[pos].current!.hp > 0 &&
      currentMove === ''
    ) {
      setCharacters((prev) => {
        prev[0].anim = {
          type: Actions.SWITCH,
        }
        return prev
      })
    } else {
      return
    }

    if (currentMove === '') {
      setCurrentMove(data)
      setTimeout(nextCurrentMove, 500)
    } else if (bufferedMove === '') {
      setBufferedMove(data)
    }
  }

  const onChargeClick = (move: Move, index: number) => {
    const data = `#ca:${index}`
    ws.send(data)
    if (status === StatusTypes.MAIN && currentMove === '') {
      setCurrentMove(data)
    } else if (status === StatusTypes.MAIN && bufferedMove === '') {
      setBufferedMove(data)
    }
    if (
      status === StatusTypes.MAIN &&
      active[charPointer].current?.hp &&
      active[charPointer].current!.hp > 0 &&
      wait <= -1 &&
      (active[charPointer].current?.energy === undefined ||
        active[charPointer].current!.energy! < move.energy) &&
      currentMove === ''
    ) {
      setCharacters((prev) => {
        setCurrentMove('#fa:')
        prev[0].anim = {
          move: moves[charPointer][0],
          type: Actions.FAST_ATTACK,
        }
        setTimeout(() => {
          nextCurrentMove()
        }, moves[charPointer][0].cooldown)
        return prev
      })
    }
  }

  const onShield = () => {
    if (status === StatusTypes.SHIELD && shields > 0 && !toShield) {
      setToShield(true)
      setShields((prev) => prev - 1)
    }
  }

  const onQuit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    ws.send('forfeit')
    e.preventDefault()
    e.stopPropagation()
    toHome()
  }

  const fastKeyClick = useKeyPress(fastKey)
  const charge1KeyClick = useKeyPress(charge1Key)
  const charge2KeyClick = useKeyPress(charge2Key)
  const switch1KeyClick = useKeyPress(switch1Key)
  const switch2KeyClick = useKeyPress(switch2Key)
  const shieldKeyClick = useKeyPress(shieldKey)

  useEffect(() => {
    if (!moves.length) {
      return
    }

    if (charge1KeyClick) {
      const move = moves[charPointer][1]
      addClickFromRef(chargeOneRef)
      onChargeClick(move, 0)
    } else if (charge2KeyClick) {
      const move = moves[charPointer][2]
      addClickFromRef(chargeTwoRef)
      onChargeClick(move, 1)
    } else if (switch1KeyClick) {
      const pos = active.findIndex(
        (poke, index) => poke.current?.hp && index !== charPointer
      )
      onSwitchClick(pos)
    } else if (switch2KeyClick) {
      const pos =
        2 -
        [...active]
          .reverse()
          .findIndex(
            (poke, index) => poke.current?.hp && 2 - index !== charPointer
          )
      onSwitchClick(pos)
    } else if (shieldKeyClick) {
      onShield()
    }
  }, [
    charge1KeyClick,
    charge2KeyClick,
    switch1KeyClick,
    switch2KeyClick,
    shieldKeyClick,
  ])

  if (fastKeyClick) {
    onClick()
  }

  useEffect(() => {
    if (ws.readyState === ws.OPEN) {
      fetchRoom()
    } else {
      toHome()
    }
  }, [])

  if (isLoading) {
    return <Loader type="TailSpin" color="#68BFF5" height={80} width={80} />
  }

  const current = active[charPointer]
  const opp = opponent[0]

  return (
    <main className={style.root} style={{ height }}>
      <div className={style.content} onClick={onClick}>
        <section className={style.nav}>
          <button className="btn btn-negative" onClick={onQuit}>
            Exit
          </button>
        </section>
        <section className={style.statuses}>
          <Status subject={current} shields={shields} remaining={remaining} />
          {[StatusTypes.CHARGE, StatusTypes.SHIELD, StatusTypes.FAINT].includes(status) && <label className={style.countdownlabel}>
            {wait}
          </label>}
          <Status subject={opp} shields={oppShields} remaining={oppRemaining} />
        </section>
        <section className={style.info}>
          <div />
          <div className={style.timer}>
            <strong>{time + ' '}</strong>
            <Icon name="clock" size="medium" />
          </div>
        </section>

        <Field characters={characters} message={message} />
        <Switch
          team={active}
          pointer={charPointer}
          countdown={swap}
          onClick={onSwitchClick}
        />
        <Charged
          moves={
            moves[charPointer]
              ? moves[charPointer].filter((_, i) => i !== 0)
              : []
          }
          refs={[chargeOneRef, chargeTwoRef]}
          currentMove={currentMove}
          bufferedMove={bufferedMove}
          energy={current && current.current ? current.current.energy : 0}
          onClick={onChargeClick}
        />
        {time <= 10 && <label className={style.countdownlabel}>
          {time}
        </label>}
        {showKeys && (
          <label ref={pressSpaceRef} className={style.keylabel}>
            {strings.hold_fastkey_button.replace(
              '%1',
              getKeyDescription(fastKey).toUpperCase()
            )}
          </label>
        )}

        <Popover
          closed={
            status === StatusTypes.MAIN || status === StatusTypes.ANIMATING
          }
          showMenu={
            status !== StatusTypes.WAITING && status !== StatusTypes.STARTING
          }
        >
          {status === StatusTypes.FAINT && (
            <Switch
              team={active}
              pointer={charPointer}
              countdown={wait}
              onClick={onSwitchClick}
              modal={true}
            />
          )}
          {status === StatusTypes.CHARGE && (
            <Stepper onStep={setChargeMult} step={chargeMult} />
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
