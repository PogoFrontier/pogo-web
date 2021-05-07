import Modal from '@components/modal/Modal'
import style from './style.module.scss'

interface ButtonProps {
  title: string
  onClick: () => void
  className: string
}

interface ErrorPopupProps {
  onClose: () => void
  error: string
  title?: string
  buttons?: ButtonProps[]
}

const ErrorPopup: React.FunctionComponent<ErrorPopupProps> = ({
  onClose,
  error,
  title,
  buttons,
}) => {
  if (!title) {
    title = "Hold up! There's an error."
  }
  if (!buttons) {
    buttons = [
      {
        title: 'Got it!',
        onClick: onClose,
        className: 'btn btn-secondary',
      },
    ]
  }

  return (
    <Modal onClose={onClose} title={title}>
      <div className={style.errormessage}>
        {error.split('\n').map((item) => {
          return (
            <>
              {item}
              <br />
            </>
          )
        })}
      </div>
      <div className={style.actions}>
        {buttons.map((buttonProps, index) => {
          return (
            <button
              className={buttonProps.className}
              onClick={buttonProps.onClick}
              key={`popupbutton${index}`}
            >
              {buttonProps.title}
            </button>
          )
        })}
      </div>
    </Modal>
  )
}

export default ErrorPopup
