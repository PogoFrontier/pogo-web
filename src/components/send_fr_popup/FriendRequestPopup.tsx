import Modal from '@components/modal/Modal'
import LanguageContext from '@context/LanguageContext'
import { useContext, useState, useEffect } from 'react'
import style from './style.module.scss'
import UserContext from '@context/UserContext'
import FriendContext from '@context/FriendContext'


interface FriendRequestPopupProps {
  onClose: (success: boolean) => void
  username: string
}

const FriendRequestPopup: React.FunctionComponent<FriendRequestPopupProps> = ({
  onClose, 
  username
}) => {
  const strings = useContext(LanguageContext).strings
  const user = useContext(UserContext).user
  const { isFriendRequestPossible, sendFriendRequest } = useContext(FriendContext)
  const [status, setStatus ] = useState<"default" | "error" | "success">("default")
  const [ err, setErr ] = useState("")

  useEffect(() => {
    if(user?.username === username) {
      setStatus("error")
      setErr(strings.send_fr_to_self_error)
      return
    }

    isFriendRequestPossible(username).then(({error}) => {
      if(error) {
        setStatus("error")
        setErr(error)
      }
    })
  }, [username])

  const close = () => {
    onClose(status === "success")
  }

  const send = () => {
    sendFriendRequest(username).then(_ => {
      setStatus("success")
    }).catch(error => {
      setStatus("error")
      setErr(error.toString())
    })
  }

  const title = {
    "default": strings.fr_popup_header_default.replace("%1", username),
    "error": strings.fr_popup_header_error.replace("%1", username),
    "success": strings.fr_popup_header_success.replace("%1", username)
  }[status]

  return (
    <Modal title={title} onClose={close}>
      {(status === "default") && <>
        <button
          className="btn btn-primary"
          style={{ marginRight: 10 }}
          onClick={send}
        >
          {strings.yes}
      </button>
      <button
        className="btn btn-negative"
        onClick={close}
      >
          {strings.no}
      </button>
      </>}

      {(status === "success") && <button
        className="btn btn-primary"
        onClick={close}
      >
        {strings.close}
      </button>}

      {!!err &&
        <div className={style.errormessage}>
          {err}
        </div>}
      
    </Modal>
  )
}

export default FriendRequestPopup
