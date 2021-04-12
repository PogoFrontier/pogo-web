import Modal from '@components/modal/Modal'
import style from './style.module.scss'

interface ErrorPopupProps {
  onClose: () => void
  error: string
}

const ErrorPopup: React.FunctionComponent<ErrorPopupProps> = ({
  onClose,
  error,
}) => {
  return (
    <Modal
      onClose={onClose}
      title="Hold up! There's an error."
    >
      <div className={style.errormessage}>{error}</div>
      <div className={style.actions}>
        <button className="btn btn-secondary" onClick={onClose}>
          Got it!
        </button>
      </div>
    </Modal>
  )
}

export default ErrorPopup
