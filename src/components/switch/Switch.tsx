import { TeamMember } from "@adibkhan/pogo-web-backend"
import classnames from 'classnames'
import getColor from "@common/actions/getColor"
import { SERVER } from "@config/index"
import style from './switch.module.scss'
import { useEffect, useState } from "react"

interface SelectorProps {
  member: TeamMember,
  index: number,
  active: boolean,
  onClick: (to: number) => void,
}

interface SwitchProps {
  team: TeamMember[],
  pointer: number,
  countdown: number,
  onClick: (to: number) => void
}

interface CharArray {
  char: TeamMember,
  index: number
}

const getImage = (sid: number): string => {
  return `${SERVER}/mini/${sid}.png`
}

const Selector: React.FC<SelectorProps> = ({ member, index, active, onClick }) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault()
    event.stopPropagation()
    onClick(index)
  }

  const image = getImage(member.sid)
  const ratio = member.current ? member.current.hp/member.hp : 1
  const color = getColor(ratio)

  return (
    <button
      onClick={handleClick}
      className={classnames([style.selector, {
        [style.active]: active
      }])}>
      <small>{index}: CP {member.cp}</small>
      <br />
      <img className={style.sprite} src={image} alt={member.speciesName}/>
      <div
        className={style.healthbar}
        style={{ width: `${ratio*100}%`, backgroundColor: color }}
      >
        <div className={style.health} />
      </div>
    </button>
  )
}

const Switch: React.FC<SwitchProps> = ({ team, pointer, countdown, onClick }) => {
  const [arr, setArr] = useState([] as CharArray[])

  useEffect(() => {
    const newArr = new Array<CharArray>()
    if (team.length > 1) {
      team.map((x, i) => {
        if (i !== pointer) {
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
    <div className={style.root}>
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
      <strong>{pointer}</strong>
    </div>
  )
}

export default Switch
