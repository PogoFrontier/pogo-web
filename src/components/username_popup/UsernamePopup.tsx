import Modal from '@components/modal/Modal'
import LanguageContext from '@context/LanguageContext'
import { useContext, useState, ChangeEvent } from 'react'
import style from './style.module.scss'
import UserContext from '@context/UserContext'

interface UsernamePopupProps {
}

const UsernamePopup: React.FunctionComponent<UsernamePopupProps> = ({
}) => {
  const strings = useContext(LanguageContext).strings
  const setUsername = useContext(UserContext).setUsername
  const [input, setInput] = useState("")
  const [showDuplicateMessage, setShowDuplicateMessage] = useState(false)

  const updateUsername = () => {
    setUsername(input).catch(err => {
      setShowDuplicateMessage(true)
    })
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  return (
    <Modal  title={"You don't have a username"}>
      <div className={style.errormessage}>
        {strings.no_username}
      </div>
      <input
        type="text"
        placeholder="None"
        id="name"
        onChange={onInputChange}
        value={input}
      />
      {showDuplicateMessage && <div className={style.errormessage}>
        {strings.duplicate_username}
      </div>}
      <div className={style.actions}>
        <button
          onClick={updateUsername}
        >
          {strings.username_change_confirm}
        </button>
      </div>
    </Modal>
  )
}

export default UsernamePopup
