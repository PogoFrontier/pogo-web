
// export const SERVER = 'http://localhost:3000/'
// export const WSS = 'ws://localhost:3000'

export const SERVER =
  process.env.NODE_ENV === 'production'
    ? 'https://pogo-web-backend.herokuapp.com/'
    : 'http://localhost:3000/'
export const WSS =
  process.env.NODE_ENV === 'production'
    ? 'wss://pogo-web-backend.herokuapp.com/'
    : 'ws://localhost:3000'

