import { SERVER } from '@config/index'
import { useState } from 'react'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import style from './select.module.scss'
import classnames from 'classnames'

interface SelectProps {
  team: TeamMember[]
  onSubmit: (values: number[]) => void
  requiredAmount?: number
}

interface ButtonProps {
  x: TeamMember
  onRegister: (index: number) => void
  i: number
  value: number
}

const getImage = (sid: number): string => {
  return `${SERVER}/mini/${sid}.png`
}

const initialValues = [-1, -1, -1, -1, -1, -1]

const findNext = (map: number[], requiredAmount: number): number => {
  const i = map.findIndex((x) => x === -1)
  return i > -1 ? i + 1 : requiredAmount
}

const Button: React.FC<ButtonProps> = ({ x, onRegister, i, value }) => {
  const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    onRegister(i)
  }

  return (
    <button className={style.select} type="button" onClick={onClick}>
      <img src={getImage(x.sid)} alt={x.speciesName} />
      {value > -1 && <div>{value}</div>}
    </button>
  )
}

const Select: React.FC<SelectProps> = ({ team, onSubmit, requiredAmount }) => {
  const [values, setValues] = useState(initialValues)
  const [map, setMap] = useState(new Array<number>(requiredAmount!).fill(-1))
  const [count, setCount] = useState(0)
  const [current, setCurrent] = useState(1)

  const register = (index: number) => {
    const deepCopy = [...values]
    const deepMap = [...map]
    if (deepCopy[index] > -1) {
      deepMap[deepMap.findIndex(x => x === index)] = -1
      deepCopy[index] = -1
      setCount((prev) => prev - 1)
    } else {
      if (count === requiredAmount) {
        deepCopy[deepCopy.findIndex(x => x === count)] = -1
        deepMap[requiredAmount - 1] = -1
      } else {
        setCount((prev) => prev + 1)
      }
      deepCopy[index] = current
      deepMap[current - 1] = index;
    }
    setValues(deepCopy)
    setMap(deepMap)
    setCurrent(findNext(deepMap, requiredAmount!))
  }

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(map)
  }

  return (
    <form className={style.root} onSubmit={submit}>
      <div className={style.selects}>
        {team.map((x, i) => (
          <Button
            x={x}
            i={i}
            key={x.speciesId}
            onRegister={register}
            value={values[i]}
          />
        ))}
      </div>
      <button
        className={classnames([style.submit, 'btn', 'btn-primary'])}
        type="submit"
        disabled={count !== requiredAmount}
      >
        Start
      </button>
    </form>
  )
}

Select.defaultProps = {
  requiredAmount: 3,
}

export default Select
