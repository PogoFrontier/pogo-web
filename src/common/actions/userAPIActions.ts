import axios from 'axios'
import { SERVER } from '@config/index'

export const postNewGoogleUser = async (
  userAuth: any,
  username?: string,
  teams?: any[]
) => {
  try {
    const res = await axios.post(`${SERVER}api/users`, {
      userAuth,
      username,
      teams,
    })
    return res.data
  } catch (err) {
    return err
  }
}

export const signInWithGoogleId = async (id: string) => {
  try {
    const res = await axios.get(`${SERVER}api/users/signin/${id}`)
    return res.data
  } catch (err) {
    return err
  }
}

export const getUserProfile = async (token: string) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
    const res = await axios.get(`${SERVER}api/users/profile`, config)
    return res.data
  } catch (err) {
    return err
  }
}

export const updateUserTeam = async (team: any, token: string) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
    const res = await axios.put(`${SERVER}api/users/teams`, team, config)
    return res.data
  } catch (err) {
    // console.log(err)
    return err
  }
}
