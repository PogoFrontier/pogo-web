import Layout from '@components/layout/Layout'
import UserContext from '@context/UserContext'
import React, { useContext, useEffect } from 'react'
import style from './style.module.scss'

const LoginPage = () => {
  const { setUser } = useContext(UserContext)

  useEffect(() => {
    setUser()
  }, [])

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
          <button>Or, Sign In With Google</button>
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
