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
    <div className={style.modal}>
      <div className={style.content}>
        <div className={style.header}>You can't battle like this</div>{' '}
      </div>
      <div className={style.errormessage}>{error}</div>
      <div className={style.actions}>
        <button className={style.button} onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  )
}

export default ErrorPopup
