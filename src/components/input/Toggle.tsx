import style from './input.module.scss'
import Switch from 'react-switch'

interface InputType {
  title: string
  checked: boolean
  onChange: (checked: boolean, event: any, id: string) => void
}

const Input: React.FC<InputType> = ({ title, checked, onChange }) => {
  return (
    <div className={style.content}>
      <label className={style.label}>{title}</label>
      <Switch className={style.toggle} checked={checked} onChange={onChange} />
    </div>
  )
}

export default Input
