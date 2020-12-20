import getImage from "@common/actions/getImage"
import { TeamMember } from "@adibkhan/pogo-web-backend"
import classnames from 'classnames'
import style from './character.module.scss'
import getColor from "@common/actions/getColor"
import { useEffect, useState } from "react"

export interface CharacterProps {
  status: "prime" | "attack" | "charge" | "switch" | "idle"
  char?: TeamMember
  back?: boolean
}

const Character: React.FunctionComponent<CharacterProps> = ({ char, back, status }) => {
  const [s, setS] = useState(status)
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    if (s !== status) {
      if (cooldown) {
        setTimeout(() => setS(status), 200);
      } else {
        setS(status);
        setCooldown(true);
        setTimeout(() => setCooldown(false), 200);
      }
    }
  }, [status])

  if (!char) {
    return <div />
  }

  const ratio = char.current!.hp/char.hp
  const color = getColor(ratio)

  return (
    <div>
      <div className={style.healthbar}>
        <div
          className={style.health}
          style={{ width: `${ratio*100}%`, backgroundColor: color }}
        />
      </div>
      <img
        className={classnames([style.char], [style[s]], { 
          [style.back]: back,
        })}
        src={getImage(char.sid, char.shiny, back)}
        alt={char.speciesName}
      />
    </div>
  )
}

export default Character