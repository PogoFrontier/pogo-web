import {
  postNewGoogleUser,
  signInWithGoogleId,
} from '@common/actions/userAPIActions'
import Input from '@components/input/Input'
import Layout from '@components/layout/Layout'
import LanguageContext from '@context/LanguageContext'
import UserContext, { User } from '@context/UserContext'
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

  const saveUserData = function (userData: User, token: any, uid: string) {
    setUser(userData)
    localStorage.setItem(
      'userToken',
      JSON.stringify({
        googleId: uid,
        token,
      })
    )
    loadUser();
  }

  useEffect(() => {
    getGoogleSignInRedirectResult().then(async (result) => {
      const googleUser = result.user

      setIsLoading(false);

      if( !googleUser?.uid || !googleUser.email) {
        return;
      }
      
        // try to load profile via google id
        try {
          let signInResult = await signInWithGoogleId(googleUser.uid);

          if (
            signInResult.error === 'User not found.'
          ) {
            // make new user
            signInResult = await postNewGoogleUser({
              // function can also save a username/teams, if local user, ask to transfer before this
              uid: googleUser.uid,
              email: googleUser.email,
              displayName: googleUser.uid
            });
          }

          // User found
          if (!signInResult.error && signInResult.userData && signInResult.token) {
            const { userData, token } = signInResult
            saveUserData(userData, token, googleUser.uid);
          }

        } catch(err: any) {
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
                      title={strings.logged_in_as}
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
                      {strings.username_change_settings}
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
