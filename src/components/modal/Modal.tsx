import classnames from 'classnames'
import style from './style.module.scss'

interface ModalProps {
  onClose?: () => void
  title: string,
  className?: string
}

const Modal: React.FunctionComponent<ModalProps> = ({
  onClose,
  title,
  className,
  children,
}) => {
  return (
    <div className={style.root}>
      <div className={classnames([style.modal, className])}>
        <div className={style.head}>
          <div className={style.title}>{title}</div>
          {onClose && <button onClick={onClose} className={style.close}>x</button>}
        </div>
        <div className={style.body}>{children}</div>
      </div>
    </div>
  )
}

export default Modal
