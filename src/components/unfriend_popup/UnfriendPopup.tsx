import Modal from '@components/modal/Modal'
import FriendContext, { FriendInfo } from '@context/FriendContext'
import LanguageContext from '@context/LanguageContext'
import { useContext, useState } from 'react'
import style from './style.module.scss'

interface UnfriendPopupProps {
  friend: FriendInfo
  onClose: (includeFriendPopup: boolean) => void
}

const UnfriendPopup: React.FunctionComponent<UnfriendPopupProps> = ({
  friend,
  onClose,
}) => {
  const strings = useContext(LanguageContext).strings
  const { unfriend } = useContext(FriendContext)
  const [status, setStatus] = useState<'default' | 'error' | 'success'>(
    'default'
  )
  const [err, setErr] = useState('')

  const close = () => {
    onClose(status !== 'default')
  }
  const yes = () => {
    unfriend(friend.id)
      .then((_) => {
        setStatus('success')
      })
      .catch((errException) => {
        setStatus('error')
        setErr(errException.toString())
      })
  }

  return (
    <Modal
      title={strings.unfriend_popup_title?.replace('%1', friend.username)}
      onClose={close}
    >
      {status === 'default' && (
        <>
          <button className="btn btn-negative" onClick={yes}>
            {strings.yes}
          </button>
          <button className="btn btn-primary" onClick={close}>
            {strings.no}
          </button>
        </>
      )}

      {status === 'success' && (
        <>
          {' '}
          <div>{strings.unfriend_confirm?.replace('%1', friend.username)}</div>
          {status === 'success' && (
            <button className="btn btn-primary" onClick={close}>
              {strings.close}
            </button>
          )}
        </>
      )}

      {!!err && <div className={style.errormessage}>{err}</div>}
    </Modal>
  )
}

export default UnfriendPopup
