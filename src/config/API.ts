import axios from 'axios'

import { SERVER } from './index'

const API = axios.create({
  baseURL: `${SERVER}`,
})

API.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default API
