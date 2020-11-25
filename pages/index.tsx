import socketClient from 'socket.io-client'
import { Dispatch } from 'redux'
import { connect as con } from 'react-redux'
import { reset as r, set as s } from '@store/socket/socketActions'
import { AppState } from '@store/store'

interface HomePageProps {
  socket: SocketIOClient.Socket | null
  set: (payload: SocketIOClient.Socket) => void
  reset: () => void
}

const SERVER = 'http://localhost:3000/'
const soc = socketClient(SERVER, {
  reconnection: false,
  autoConnect: false,
})

const HomePage: React.FunctionComponent<HomePageProps> = ({
  socket,
  set,
  reset,
}) => {
  function connect() {
    if (socket === null) {
      soc.connect()
      set(soc)
    } else {
      disconnect()
    }
  }

  function disconnect() {
    if (socket !== null) {
      socket.disconnect()
      reset()
    }
  }

  return (
    <main>
      <h1>Hello, world!</h1>
      <button onClick={connect}>
        {socket === null ? 'Connect ' : 'Disconnect '}
        To Server
      </button>
    </main>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  set: (payload: SocketIOClient.Socket) => dispatch(s(payload)),
  reset: () => dispatch(r()),
})

const mapStateToProps = ({ socket }: AppState) => ({
  socket: socket.socket,
})

export default con(mapStateToProps, mapDispatchToProps)(HomePage)
