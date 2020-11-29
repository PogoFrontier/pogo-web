import { useContext, useState } from 'react'
import { useRouter } from 'next/router'
import SocketContext from '@context/SocketContext'
import style from './form.module.scss'

const Form: React.FunctionComponent = () => {
  const [room, setRoom] = useState("")
  const socket: SocketIOClient.Socket = useContext(SocketContext)
  const router = useRouter()

  function connect() {
    socket.on('connect', () => {
      // Connected, let's sign-up for to receive messages for this room
      socket.emit('room', room);
    })
    socket.connect();
    router.push(`/matchup/${room}`)
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRoom(e.target.value)
  }

  return (
    <>
      <input value={room} placeholder="Room Name" onChange={onChange} />
      <button className={style.button} onClick={connect}>Make room</button>
    </>
  )
}

export default Form