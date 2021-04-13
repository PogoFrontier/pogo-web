import style from './style.module.scss'

interface ModalProps {
  onClose?: () => void
  title: string
}

const Modal: React.FunctionComponent<ModalProps> = ({
  onClose,
  title,
  children,
}) => {
  return (
    <div className={style.root}>
      <div className={style.modal}>
        <div className={style.head}>
          <div className={style.title}>{title}</div>
          {onClose && <button className={style.close}>x</button>}
        </div>
        <div className={style.body}>{children}</div>
      </div>
    </div>
  )
}

export default Modal
