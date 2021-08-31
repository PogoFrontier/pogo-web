import { useContext, useState, ChangeEvent } from 'react'
import style from './account.module.scss'

import SettingsContext from '@context/SettingsContext'
import LanguageContext from '@context/LanguageContext'
import UserContext from '@context/UserContext'

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
      {user?.email && <>
        <div >
          {strings.username_change_settings}
        </div>
        <input
          type="text"
          placeholder="None"
          id="name"
          onChange={onInputChange}
          value={input}
        />
        {!!usernameFeedback && <div className={style.errormessage}>
          {usernameFeedback}
        </div>}
        <div className={style.actions}>
          <button
            onClick={updateUsername}
          >
            {strings.username_change_confirm}
          </button>
        </div>
      </>}

      <button className="btn btn-negative" onClick={settings.clear}>
        {strings.clear_data}
      </button>
    </div>
  )
}

export default Account
