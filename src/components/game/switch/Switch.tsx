import { TeamMember } from '@adibkhan/pogo-web-backend'
import style from './switch.module.scss'
import { useContext } from 'react'
import classnames from 'classnames'
import getColor from '@common/actions/getColor'
import ImageHandler from '@common/actions/getImages'
import getKeyDescription from '@common/actions/getKeyDescription'
import SettingsContext from '@context/SettingsContext'

interface SwitchProps {
  team: TeamMember[]
  pointer: number
  countdown: number
  onClick: (to: number) => void
  modal?: boolean
}

interface CharArray {
  char: TeamMember
  index: number
}

interface SelectorProps {
  member: TeamMember
  index: number
  active: boolean
  onClick: (to: number) => void
}

const Selector: React.FC<SelectorProps> = ({
  member,
  index,
  active,
  onClick,
}) => {
  const imageHandler = new ImageHandler()
  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault()
    event.stopPropagation()
    onClick(index)
  }

  const image = imageHandler.getMini(member.sid)
  const ratio = member.current!.hp
  const color = getColor(ratio)

  return (
    <button
      onClick={handleClick}
      className={classnames([
        style.selector,
        {
          [style.active]: active,
        },
      ])}
    >
      <small>CP {member.cp}</small>
      <br />
      <img
        className={classnames([
          style.sprite,
          {
            [style.inactive]: !active,
          },
        ])}
        src={image}
        alt={typeof member.speciesName === "string"
        ? member.speciesName
        : member.speciesId}
        draggable="false"
      />
      <div
        className={style.healthbar}
        style={{ width: `${ratio * 100}%`, backgroundColor: color }}
      >
        <div className={style.health} />
      </div>
    </button>
  )
}

const Switch: React.FC<SwitchProps> = ({
  team,
  pointer,
  countdown,
  onClick,
  modal,
}) => {
  const arr = new Array<CharArray>()
  if (team.length > 1) {
    team.map((x, i) => {
      if (i !== pointer && x.current && x.current?.hp > 0) {
        arr.push({
          char: x,
          index: i,
        })
      }
    })
  }

  if (team.length <= 1) {
    return <div />
  }

  const { showKeys, keys } = useContext(SettingsContext)
  const { switch1Key, switch2Key } = keys

  return (
    <div
      className={classnames([
        style.root,
        {
          'no-click': !modal && countdown > 0,
          [style.modal]: modal,
        },
      ])}
    >
      {arr.map((x, index) => {
        return (
          <div key={'switchButton' + index} className={style.row}>
            {showKeys && (
              <label className={style.keylabel}>
                (
                {getKeyDescription(
                  [switch1Key, switch2Key][index]
                ).toUpperCase()}
                )
              </label>
            )}
            <Selector
              member={x.char}
              index={x.index}
              onClick={onClick}
              active={modal || countdown <= 0}
              key={x.index.toString()}
            />
          </div>
        )
      })}
      {!modal && <strong>{countdown}</strong>}
    </div>
  )
}

export default Switch
