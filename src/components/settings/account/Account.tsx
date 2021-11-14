import { useContext, useState, ChangeEvent } from 'react'
import style from './account.module.scss'

import SettingsContext from '@context/SettingsContext'
import LanguageContext from '@context/LanguageContext'
import UserContext from '@context/UserContext'
import Input from '@components/input/Input'

const Account = () => {
  const settings = useContext(SettingsContext)
  const { user, setUsername } = useContext(UserContext)
  const strings = useContext(LanguageContext).strings
  const [input, setInput] = useState(user?.username ? user.username : "")
  const [usernameFeedback, setUsernameFeedback] = useState("")

  const updateUsername = () => {
    if (user.username === input) {
      setUsernameFeedback(strings.username_unchanged)
      return
    }
    setUsernameFeedback("")

    setUsername(input).then(_ => {
      setUsernameFeedback(strings.username_change_success)
    }).catch(_ => {
      setUsernameFeedback(strings.duplicate_username)
    })
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  return (
    <div className={style.root}>
      <div>
        {user?.email && (
        <section>
          <div >
            {strings.username_change_settings}
          </div>
          <Input
            title="username"
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
            {strings.username_change_confirm}
          </button>
          <hr />
        </section>)}
        <section>
          <button className="btn btn-negative btn-block" onClick={settings.clear}>
            {strings.clear_data}
          </button>
        </section>
      </div>
    </div>
  )
}

export default Account
