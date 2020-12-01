import Form from '@components/form/Form'
import SocketContext from '@context/SocketContext'
import { useContext, useEffect, useState } from 'react'

const HomePage = () => {
  const ws: WebSocket = useContext(SocketContext)
  const [state, setState] = useState(ws.readyState)

  const waitForSocketConnection = () => {
    setTimeout(() => {
      if (ws.readyState === ws.CONNECTING) {
        waitForSocketConnection()
      } else {
        setState(ws.readyState)
      }
    }, 5)
  }

  useEffect(() => {
    setState(ws.readyState)
    if (ws.readyState === ws.CONNECTING) {
      waitForSocketConnection()
    }
    ws.onclose = () => {
      setState(ws.readyState)
    }
    return function cleanup() {
      ws.onclose = null
    }
  }, [])
  return (
    <main>
      <h1>Hello, world!</h1>
      {(state === ws.CLOSED || ws.readyState === ws.CLOSING) && (
        <p>Disconnected</p>
      )}
      {state === ws.CONNECTING && <p>Connecting...</p>}
      {state === ws.OPEN && <Form />}
    </main>
  )
}

export default HomePage
