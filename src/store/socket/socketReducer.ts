import { SocketAction, SocketActionTypes } from './socketActions'

export interface SocketState {
  readonly socket: SocketIOClient.Socket | {}
}

const initialSocketState = {
  socket: {},
}

/**
 * Counter Reducer
 */
export const socketReducer = (
  state: SocketState = initialSocketState,
  action: SocketAction
) => {
  switch (action.type) {
    case SocketActionTypes.SET:
      return {
        ...state,
        socket: action.payload,
      }
    case SocketActionTypes.RESET:
      return initialSocketState
    default:
      return state
  }
}
