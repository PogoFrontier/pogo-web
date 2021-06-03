import API from '@config/API'

// add username/password login actions

export const postNewGoogleUser = async (
  userAuth: any,
  username?: string,
  teams?: any[]
) => {
  try {
    const res = await API.post(`api/users`, {
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
    const res = await API.get(`api/users/signin/${id}`)
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
    const res = await API.get(`api/users/profile`, config)
    return res.data
  } catch (err) {
    return err
  }
}

export const updateUserTeams = async (teams: any[], token: string | null) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
    const res = await API.put(`api/users/setteams`, { teams }, config)
    return res.data
  } catch (err) {
    // console.log(err)
    return err
  }
}
