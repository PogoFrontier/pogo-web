import {
  postNewGoogleUser,
  signInWithGoogleId,
} from '@common/actions/userAPIActions'
import Input from '@components/input/Input'
import Layout from '@components/layout/Layout'
import LanguageContext from '@context/LanguageContext'
import UserContext from '@context/UserContext'
import { useRouter } from 'next/router'
import React, { ChangeEvent, useContext, useEffect, useState } from 'react'
import Loader from 'react-loader-spinner'
import {
  getGoogleSignInRedirectResult,
  googleSignInWithRedirect,
} from 'src/firebase'
import style from './style.module.scss'

const LoginPage = () => {
  const { setUser, user, setUsername, loadUser } = useContext(UserContext)
  const strings = useContext(LanguageContext).strings
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [input, setInput] = useState(user?.username ? user.username : "")
  const [usernameFeedback, setUsernameFeedback] = useState("")

  useEffect(() => {
    if (user && user.username) {
      setInput(user.username)
    }
  }, [user && user.username])

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
            if (
              signInResult.error &&
              signInResult.error === 'User not found.'
            ) {
              // make new user
              postNewGoogleUser({
                // function can also save a username/teams, if local user, ask to transfer before this
                uid: googleUser.uid,
                email: googleUser.email,
                displayName: googleUser.uid
              })
              .then((newUser) => {
                setIsLoading(false)
                // set user, save token, and store auth in local storage
                const { userData, token } = newUser
                setInput(userData.username)
                if (userData && token) {
                  console.log("Set UserData and token")
                  setUser(userData)
                  localStorage.setItem(
                    'userToken',
                    JSON.stringify({
                      googleId: googleUser.uid,
                      token,
                    })
                  )
                  loadUser();
                } else {
                  // corrupted data
                }
              })
              .catch((/* err */) => {
                // all errors here are server error, since we know the user does not already exist
                setIsLoading(false)
              })
            } else {
              // set user, save token, and store auth in local storage
              const { userData, token } = signInResult
              if (userData && token) {
                console.log("UserData and token")
                setUser(userData)
                localStorage.setItem(
                  'userToken',
                  JSON.stringify({
                    googleId: googleUser.uid,
                    token,
                  })
                )
                loadUser();
              } else {
                // corrupted data
              }
              setIsLoading(false)
            }
          })
          .catch((err) => {
            // console.log(err)
            setIsLoading(false)
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
        setIsLoading(false)
      }
    }) /* .catch(err => console.log(err)); */
  }, [])

  const onSubmitGoogleSignIn = () => {
    googleSignInWithRedirect() /* .then(res => console.log(res)).catch(err => console.log(err)); */
  }

  const toHome = () => {
    router.push('/')
  }

  const updateUsername = () => {
    if (user.username === input) {
      setUsernameFeedback(strings.username_unchanged)
      return
    }
    setUsernameFeedback("")

    setUsername(input).then(_ => {
      setUsernameFeedback(strings.username_change_success)
      loadUser();
    }).catch(_ => {
      setUsernameFeedback(strings.duplicate_username)
    })
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
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
          {
            isLoading
            ? (
              <Loader type="TailSpin" color="#68BFF5" height={30} width={30} />
            ) : (
              <div>
                {isLoggedIn ? (
                  <div>
                    <Input
                      title="Logged In As:"
                      type="text"
                      placeholder="None"
                      id="name"
                      onChange={onInputChange}
                      value={input}
                    />
                    {!!usernameFeedback && <div className={style.errormessage}>
                      {usernameFeedback}
                    </div>}
                    <button
                      className="btn btn-secondary"
                      onClick={updateUsername}
                    >
                      Change Username
                    </button>
                    <hr />
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
            )
         }
        </div>
      </main>
    </Layout>
  )
}

export default LoginPage
