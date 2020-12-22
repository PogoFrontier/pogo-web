import { TeamMember } from "@adibkhan/pogo-web-backend"
import style from './switch.module.scss'
import { useEffect, useState } from "react"
import Selector from '../selector/Selector'
import classnames from "classnames"

interface SwitchProps {
  team: TeamMember[],
  pointer: number,
  countdown: number,
  onClick: (to: number) => void,
  modal?: boolean
}

interface CharArray {
  char: TeamMember,
  index: number
}

const Switch: React.FC<SwitchProps> = ({ team, pointer, countdown, onClick, modal }) => {
  const [arr, setArr] = useState([] as CharArray[])

  useEffect(() => {
    const newArr = new Array<CharArray>()
    if (team.length > 1) {
      team.map((x, i) => {
        if (i !== pointer && x.current && x.current?.hp > 0) {
          newArr.push({
            char: x,
            index: i
          })
        }
      })
      setArr(newArr!)
    }
  }, [pointer])

  if (team.length <= 1) {
    return (<div />)
  }

  return (
    <div className={classnames([style.root, {
      [style.modal]: modal
    }])}>
      {
        arr.map((x) => {
          return (
            <Selector
              member={x.char}
              index={x.index}
              onClick={onClick}
              active={countdown <= 0}
              key={x.index.toString()}
            />
          )
        })
      }
      <strong>{countdown}</strong>
    </div>
  )
}

export default Switch
