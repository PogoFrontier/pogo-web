import { Action } from 'redux'

export enum SocketActionTypes {
  SET = 'SET',
  RESET = 'RESET',
}

type SocketSetAction = {
  type: SocketActionTypes.SET,
  payload: SocketIOClient.Socket
}

export type SocketAction =
  | SocketSetAction
  | Action<SocketActionTypes.RESET>

export function set(payload: SocketIOClient.Socket): SocketAction {
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
