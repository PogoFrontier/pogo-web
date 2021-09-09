import {
  postNewGoogleUser,
  signInWithGoogleId,
} from '@common/actions/userAPIActions'
import Layout from '@components/layout/Layout'
import LanguageContext from '@context/LanguageContext'
import UserContext from '@context/UserContext'
import { useRouter } from 'next/router'
import React, { useContext, useEffect } from 'react'
import {
  getGoogleSignInRedirectResult,
  googleSignInWithRedirect,
} from 'src/firebase'
import style from './style.module.scss'

const LoginPage = () => {
  const { setUser, user } = useContext(UserContext)
  const strings = useContext(LanguageContext).strings
  const router = useRouter()

  useEffect(() => {
    getGoogleSignInRedirectResult().then((result) => {
      const googleUser = result.user
      if (
        googleUser &&
        googleUser.uid &&
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

  const toHome = () => {
    router.push('/')
  }

  const isLoggedIn = user && user.email

  return (
    <Layout>
      <main className={style.root}>
        <div className={style.container}>
          <h1>
            {isLoggedIn
              ? strings.logged_in
              : strings.join_battle}
          </h1>
          <div>
            {isLoggedIn ? (
              <div>
                <button className="btn btn-primary" onClick={toHome}>
                  {strings.start_battling}
                </button>
                {/* <button
                    className="btn btn-negative"
                    onClick={logout}
                  >
                    strings.log_out
                  </button> */}
              </div>
            ) : (
              <div>
                <button
                  className="btn btn-primary"
                  onClick={onSubmitGoogleSignIn}
                >
                  {strings.login_button_google}
                </button>
                <br />
                <p>{strings.login_more_options}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  )
}

export default LoginPage
