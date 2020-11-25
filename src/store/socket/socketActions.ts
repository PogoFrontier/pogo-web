import { Action } from 'redux'
import { Socket } from 'socket.io-client'

export enum SocketActionTypes {
  SET = 'SET',
  RESET = 'RESET',
}

type SocketSetAction = {
  type: SocketActionTypes.SET,
  payload: Socket
}

export type SocketAction =
  | SocketSetAction
  | Action<SocketActionTypes.RESET>

export function set(payload: Socket): SocketAction {
  return {
    type: SocketActionTypes.SET,
    payload
  }
}

export function reset(): SocketAction {
  return {
    type: SocketActionTypes.RESET
  }
}
