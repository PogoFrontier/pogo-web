import { useRouter } from "next/router"

const GamePage = () => {
  const router = useRouter()
  const { room } = router.query
  return (
    <main>{room}</main>
  )
}

export default GamePage