import { SocketAction, SocketActionTypes } from './socketActions'
import { Socket } from 'socket.io-client';

export interface SocketState {
  readonly socket: Socket | null
}

const initialSocketState = {
  socket: null,
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
