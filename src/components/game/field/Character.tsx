import classnames from 'classnames'
import style from './character.module.scss'
import getColor from '@common/actions/getColor'
import { useEffect, useState } from 'react'
import ImageHandler from '@common/actions/getImages'
import { Anim, TeamMember } from '@adibkhan/pogo-web-backend'
import { Actions } from '@adibkhan/pogo-web-backend/actions'

export interface CharacterProps {
  anim?: Anim
  char?: TeamMember
  back?: boolean
}

const Character: React.FunctionComponent<CharacterProps> = ({
  char,
  back,
  anim,
}) => {
  const imagesHandler = new ImageHandler()
  const [s, setS] = useState('')
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (anim && !(s.startsWith('sw') && anim.type === 'sw')) {
      const cooldown =
        anim.type === Actions.FAST_ATTACK ? anim.move!.cooldown! : 500
      setS(`${anim.type}${cooldown}`)
      setCount((prev) => prev + 1)
    } else if (!anim) {
      setS('')
    }
  }, [anim])

  const onAnimationEnd = () => {
    setS('')
  }

  if (!char) {
    return <div />
  }

  const ratio = char.current!.hp
  const color = getColor(ratio)

  return (
    <div className={style.root}>
      <div className={style.healthbar}>
        <div
          className={style.health}
          style={{ width: `${ratio * 100}%`, backgroundColor: color }}
        />
      </div>
      <div
        className={classnames(style.imgcontainer, {
          [style.back]: back,
        })}
      >
        <img
          key={`${count}|${back}`}
          onAnimationEnd={onAnimationEnd}
          className={classnames([
            style.char,
            style[s],
            {
              [style.back]: back,
            },
          ])}
          draggable="false"
          src={imagesHandler.getImage(char.sid, char.shiny, back)}
          alt={char.speciesName}
        />
      </div>
    </div>
  )
}

export default Character
