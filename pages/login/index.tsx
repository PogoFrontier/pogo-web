import {
  postNewGoogleUser,
  signInWithGoogleId,
} from '@common/actions/userAPIActions'
import Layout from '@components/layout/Layout'
import UserContext from '@context/UserContext'
import React, { useContext, useEffect } from 'react'
import {
  getGoogleSignInRedirectResult,
  googleSignInWithRedirect,
} from 'src/firebase'
import style from './style.module.scss'

const LoginPage = () => {
  const { setUser } = useContext(UserContext)

  useEffect(() => {
    getGoogleSignInRedirectResult().then((result) => {
      const googleUser = result.user
      if (
        googleUser &&
        googleUser.uid &&
        googleUser.displayName &&
        googleUser.email
      ) {
        // try to load profile via google id
        signInWithGoogleId(googleUser.uid)
          .then((signInResult) => {
            // console.log(signInResult)
            if (
              signInResult.error &&
              signInResult.error === 'User not found.'
            ) {
              // make new user
              postNewGoogleUser({
                // function can also save a username/teams, if local user, ask to transfer before this
                uid: googleUser.uid,
                displayName: googleUser.displayName,
                email: googleUser.email,
              })
                .then((newUser) => {
                  // console.log(newUser)
                  // set user, save token, and store auth in local storage
                  const { userData, token } = newUser
                  if (userData && token) {
                    setUser(userData)
                    localStorage.setItem(
                      'userToken',
                      JSON.stringify({
                        googleId: googleUser.uid,
                        token,
                      })
                    )
                  } else {
                    // corrupted data
                  }
                })
                .catch((/* err */) => {
                  // all errors here are server error, since we know the user does not already exist
                  // console.log(err);
                })
            } else {
              // set user, save token, and store auth in local storage
              const { userData, token } = signInResult
              if (userData && token) {
                setUser(userData)
                localStorage.setItem(
                  'userToken',
                  JSON.stringify({
                    googleId: googleUser.uid,
                    token,
                  })
                )
              } else {
                // corrupted data
              }
            }
          })
          .catch((err) => {
            // console.log(err)
            if (err.response && err.response.status) {
              switch (err.response.status) {
                case 401:
                  break
                case 500:
                  // internal server error, display error message
                  break
                default:
                  // other unknown error, display error message
                  break
              }
            }
          })
      } else {
        // no redirect happened, I think
      }
    }) /* .catch(err => console.log(err)); */
  }, [])

  const onSubmitGoogleSignIn = () => {
    googleSignInWithRedirect() /* .then(res => console.log(res)).catch(err => console.log(err)); */
  }

  return (
    <Layout>
      <main className={style.root}>
        <h1>Sign In Or Sign Up</h1>
        <div>
          <form action="">
            <h3>Sign In</h3>
            <label>Username</label>
            <input type="text" />
            <br />
            <label>Password</label>
            <input type="password" />
            <br />
            <button type="submit">Submit</button>
          </form>
          <br />
          <button onClick={onSubmitGoogleSignIn}>
            Or, Sign In With Google
          </button>
        </div>
        <div>
          <p>
            Don't have an account? <button>Create an Account</button>
          </p>
        </div>
      </main>
    </Layout>
  )
}

export default LoginPage
