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
      if (googleUser) {
        // try to load profile via google id
        // if no profile exists, create new account
        setUser({
          googleId: googleUser.uid,
          displayName: googleUser.displayName,
          email: googleUser.email,
          teams: [],
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
