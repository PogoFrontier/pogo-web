import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import SocketContext from '@context/SocketContext'
import TeamContext from '@context/TeamContext'
import { TeamMember } from 'types/team'
import Team from '@components/team/Team'
import { SERVER } from '@config/index'

interface RoomJoinPayload {
  id: string,
  team: TeamMember[]
}

const parseJSON = (response: Response) => {
  return response.text().then(function(text) {
    return text ? JSON.parse(text) : {}
  })
}

const MatchupPage = () => {
  const router = useRouter()
  const [opponentTeam, setOpponentTeam] = useState([] as TeamMember[])
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

  const toHome = () => {
    router.push("/")
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
    </main>
  )
}

export default MatchupPage
