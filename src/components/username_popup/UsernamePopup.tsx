import Modal from '@components/modal/Modal'
import LanguageContext from '@context/LanguageContext'
import { useContext, useState, ChangeEvent } from 'react'
import style from './style.module.scss'
import UserContext from '@context/UserContext'
import Input from '@components/input/Input'

const UsernamePopup: React.FunctionComponent = ({
}) => {
  const strings = useContext(LanguageContext).strings
  const setUsername = useContext(UserContext).setUsername
  const [input, setInput] = useState("")
  const [showDuplicateMessage, setShowDuplicateMessage] = useState(false)

  const updateUsername = () => {
    setUsername(input).catch(_ => {
      setShowDuplicateMessage(true)
    })
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  return (
    <Modal title={"You don't have a username"}>
      <div className={style.errormessage}>
        {strings.no_username}
      </div>
      <Input
        title="username"
        type="text"
        placeholder="Enter Username"
        id="username"
        onChange={onInputChange}
        value={input}
      />
      {showDuplicateMessage && <div className={style.errormessage}>
        {strings.duplicate_username}
      </div>}
      <button
        className="btn btn-primary"
        onClick={updateUsername}
      >
        {strings.username_change_confirm}
      </button>
    </Modal>
  )
}

export default UsernamePopup
