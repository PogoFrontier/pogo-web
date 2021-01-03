import Form from '@components/form/Form'
import SocketContext from '@context/SocketContext'
import { useContext, useEffect, useState } from 'react'
import { signInWithGoogle } from '../src/firebase'
import style from './style.module.scss'

const HomePage = () => {
  const ws: WebSocket = useContext(SocketContext)
  const [state, setState] = useState(ws.readyState)

  useEffect(() => {
    setState(ws.readyState)
    let x: NodeJS.Timeout
    if (ws.readyState === ws.CONNECTING) {
      x = setInterval(() => {
        if (ws.readyState !== ws.CONNECTING) {
          setState(ws.readyState)
        }
        if (ws.readyState === ws.CLOSED) {
          clearInterval(x)
        }
      }, 100)
    }
    return function cleanup() {
      if (x) {
        clearInterval(x)
      }
    }
  }, [])

  const reconnect = () => {
    location.reload()
  }

  return (
    <main className={style.root}>
      <div className={style.content}>
        {(state === ws.CLOSED || ws.readyState === ws.CLOSING) && (
          <>
            <p>Disconnected</p>
            <button onClick={reconnect}>Reconnect</button>
          </>
        )}
        {state === ws.CONNECTING && <p>Connecting...</p>}
        {state === ws.OPEN && <Form />}
        <button onClick={signInWithGoogle}>Sign In With Google</button>
      </div>
    </main>
  )
}

export default HomePage
