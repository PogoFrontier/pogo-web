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
      // console.log(result)
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
            const { userData, token } = signInResult.token
            if (userData && token) {
              // set user, save token, and store auth in local storage
              setUser(userData)
              localStorage.setItem(
                'authedUser',
                JSON.stringify({
                  // ALSO SAVE TOKEN!!
                  googleId: googleUser.uid,
                  email: googleUser.email,
                })
              )
            } else {
              // corrupted data
            }
          })
          .catch((err) => {
            if (err.response && err.response.status) {
              switch (err.response.status) {
                case 401:
                  // user does not exist, create a new one
                  postNewGoogleUser({
                    // function can also save a username/teams, if local user, ask to transfer before this
                    uid: googleUser.uid,
                    displayName: googleUser.displayName,
                  })
                    .then((newUser) => {
                      // set user, save token, and store auth in local storage
                      const { userData, token } = newUser.data
                      if (userData && token) {
                        setUser(userData)
                        localStorage.setItem(
                          'authedUser',
                          JSON.stringify({
                            // ALSO SAVE TOKEN!!
                            googleId: googleUser.uid,
                            email: googleUser.email,
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
