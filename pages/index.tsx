import Form from '@components/form/Form'
import SocketContext from '@context/SocketContext'
import { useContext, useEffect, useState } from 'react'

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
    <main>
      <h1>Hello, world!</h1>
      {(state === ws.CLOSED || ws.readyState === ws.CLOSING) && (
        <>
          <p>Disconnected</p>
          <button onClick={reconnect}>Reconnect</button>
        </>
      )}
      {state === ws.CONNECTING && <p>Connecting...</p>}
      {state === ws.OPEN && <Form />}
    </main>
  )
}

export default HomePage
