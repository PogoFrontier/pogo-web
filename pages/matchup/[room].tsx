import { useRouter } from 'next/router'

const MatchupPage = () => {
  const router = useRouter()
  const { room } = router.query
  
  return (
    <main>
      <h1>Room Code: {room}</h1>
    </main>
  )
}

export default MatchupPage
