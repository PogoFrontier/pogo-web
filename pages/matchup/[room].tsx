import { useRouter } from 'next/router'

const MatchupPage = () => {
  const router = useRouter()
  const { room } = router.query

  const toHome = () => {
    router.push("/")
  }
  
  return (
    <main>
      <header>
        <h1>Room Code: {room}</h1>
        <button onClick={toHome}>Exit</button>
      </header>
    </main>
  )
}

export default MatchupPage
