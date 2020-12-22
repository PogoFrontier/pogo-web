import classnames from 'classnames'
import getColor from "@common/actions/getColor"
import { SERVER } from "@config/index"
import { TeamMember } from '@adibkhan/pogo-web-backend/team'
import style from './selector.module.scss'

interface SelectorProps {
  member: TeamMember,
  index: number,
  active: boolean,
  onClick: (to: number) => void,
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
  const ratio = member.current ? Math.min(member.current.hp/member.hp, 1) : 1
  const color = getColor(ratio)

  return (
    <button
      onClick={handleClick}
      className={classnames([style.selector, {
        [style.active]: active
      }])}>
      <small>CP {member.cp}</small>
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

export default Selector
