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
    const res = await API.post(`api/users/setteams`, { teams }, config)
    // console.log(res.data)
    return res.data
  } catch (err) {
    // console.log(err)
    return err
  }
}

export const updateUsername = async (username: string, token: string | null) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
    const res = await API.post(`api/users/username`, { username }, config)
    return res.data
  } catch (err) {
    return err
  }
}

export const isFriendRequestPossible: (username: string, token: string | null) => Promise<{ possible: boolean, error?: string }> = async (username: string, token: string | null) => { 
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
    const res = await API.get(`api/users/request/possible/${username}`, config)
    if(res.status === 200) {
      return {
        possible: true
      }
    }

    return {
      possible: false,
      error: res.data.error
    }
  } catch (err) {
    return {
      possible: false,
      error: err.toString()
    }
  }
}


export const sendFriendRequest = async (username: string, token: string | null) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }
  const res = await API.post(`api/users/request/send`, { username }, config)
  return res.data
}

export const declineFriendRequest = async (id: string, token: string | null) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }
  const res = await API.post(`api/users/request/deny`, { googleId: id }, config)
  return res.data
}

export const acceptFriendRequest = async (id: string, token: string | null) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }
  const res = await API.post(`api/users/request/accept`, { googleId: id }, config)
  return res.data
}

export const getFriendList = async (token: string) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
    const res = await API.get(`api/users/friends`, config)
    return res.data
  } catch (err) {
    return err
  }
}