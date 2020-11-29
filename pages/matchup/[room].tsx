import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import SocketContext from '@context/SocketContext'
import TeamContext from '@context/TeamContext'
import { TeamMember } from 'types/team'
import Team from '@components/team/Team'
import { SERVER } from '@config/index'
import Select from '@components/select/Select'
import parseJSON from '@common/actions/parseJSON'

enum STATUS {
  CHOOSING,
  WAITING
}

interface RoomJoinPayload {
  id: string,
  team: TeamMember[]
}

const MatchupPage = () => {
  const router = useRouter()
  const [opponentTeam, setOpponentTeam] = useState([] as TeamMember[])
  const [status, setStatus] = useState(STATUS.CHOOSING)
  const { room } = router.query
  const socket: SocketIOClient.Socket = useContext(SocketContext)
  const team: TeamMember[] = useContext(TeamContext)

  useEffect(() => {
    if (socket.connected) {
      fetch(`${SERVER}/opponent/${room}/${socket.id}`)
      .then((response) => parseJSON(response))
      .then(data => {
        if (data && data.length) {
          setOpponentTeam(data)
        }
        return
      })
      socket.on("room_join", (payload: RoomJoinPayload) => {
        setOpponentTeam(payload.team)
      })
      socket.on("room_leave", () => {
        setOpponentTeam([])
      })
      socket.on("disconnected", () => {
        socket.removeAllListeners()
        toHome()
      })
    } else {
      toHome()
    }
  }, [])

  const onSubmit = (values: number[]) => {
    const submission: TeamMember[] = []
    for (const value of values) {
      submission.push(team[value])
    }
    socket.emit("team_submit", submission)
    setStatus(STATUS.WAITING)
    socket.on("team_confirm", () => {
      toGame();
    })
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
