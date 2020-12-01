import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import SocketContext from '@context/SocketContext'
import TeamContext from '@context/TeamContext'
import { TeamMember } from 'types/team'
import Team from '@components/team/Team'
import Select from '@components/select/Select'
import { CODE } from 'types/socket'

enum STATUS {
  CHOOSING,
  WAITING
}

interface Payload {
  team?: TeamMember[]
}

interface Data {
  type: CODE,
  payload?: Payload
}

const MatchupPage = () => {
  const router = useRouter()
  const [opponentTeam, setOpponentTeam] = useState([] as TeamMember[])
  const [status, setStatus] = useState(STATUS.CHOOSING)
  const { room } = router.query
  const ws: WebSocket = useContext(SocketContext)
  const team: TeamMember[] = useContext(TeamContext)

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
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        type: CODE.get_opponent,
        payload: {
          room
        }
      }))
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
    ws.send(JSON.stringify({
      type: CODE.team_submit,
      payload: {
        room,
        team: submission
      }
    }))
    setStatus(STATUS.WAITING)
  }

  const toHome = () => {
    router.push("/")
  }

  const toGame = () => {
    router.push(`/game/${room}`)
  }
  
  return (
    <main>
      <header>
        <h1>Room Code: {room}</h1>
        <button onClick={toHome}>Exit</button>
      </header>
      {
        opponentTeam.length > 0 &&
        <Team team={opponentTeam} />
      }
      <Team team={team} isPlayer />
      {
        status === STATUS.CHOOSING &&
        <Select team={team} onSubmit={onSubmit} />
      }
      {
        status === STATUS.WAITING &&
        <p>Waiting for opponent...</p>
      }
    </main>
  )
}

export default MatchupPage
