// export const SERVER = 'http://pogo-web-backend.eba-gjbsq2ui.us-east-2.elasticbeanstalk.com:8080/'
// export const WSS = 'ws://pogo-web-backend.eba-gjbsq2ui.us-east-2.elasticbeanstalk.com:8082/'

export const SERVER =
  process.env.NODE_ENV === 'production'
    ? 'http://pogo-web-backend.eba-gjbsq2ui.us-east-2.elasticbeanstalk.com:8080/'
    : 'http://localhost:8081/'
export const WSS =
  process.env.NODE_ENV === 'production'
    ? 'ws://pogo-web-backend.eba-gjbsq2ui.us-east-2.elasticbeanstalk.com:8082/'
    : 'ws://localhost:8088/'

export const CDN_BASE_URL = 'https://d1bbfbaqrr54l0.cloudfront.net'
