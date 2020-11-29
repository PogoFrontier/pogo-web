import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import SocketContext from '@context/SocketContext'
import TeamContext from '@context/TeamContext'
import { TeamMember } from 'types/team'
import Team from '@components/team/Team'

interface RoomJoinPayload {
  id: string,
  team: TeamMember[]
}

const MatchupPage = () => {
  const router = useRouter()
  const [opponentTeam, setOpponentTeam] = useState([] as TeamMember[])
  const { room } = router.query
  const socket: SocketIOClient.Socket = useContext(SocketContext)
  const team: TeamMember[] = useContext(TeamContext)

  useEffect(() => {
    socket.on("room_join", (payload: RoomJoinPayload) => {
      setOpponentTeam(payload.team)
    })
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
      <Team team={opponentTeam} />
      <Team team={team} isPlayer />
    </main>
  )
}

export default MatchupPage
