import classnames from "classnames"
import { DetailedHTMLProps, InputHTMLAttributes } from "react"
import style from './input.module.scss'

interface InputType extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  title: string,
  highlighted?: boolean
}

const Input: React.FC<InputType> = ({ title, highlighted, ...inputProps }) => {
  return (
    <>
      <label className={style.label}>
        {title}
      </label>
      <br />
      <input
        {...inputProps}
        className={classnames([style.input, { [style.highlighted]: highlighted }])}
      />
    </>
  )
}

export default Input