import getImage from "@common/actions/getImage"
import { TeamMember } from "types/team"
import classnames from 'classnames'
import style from './character.module.scss'
import getColor from "@common/actions/getColor"

export interface CharacterProps {
  status: "prime" | "attack" | "charge" | "idle"
  char: TeamMember
  back?: boolean
}

const Character: React.FunctionComponent<CharacterProps> = ({ char, back, status }) => {
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
        className={classnames([style.char], { 
          [style.back]: back,
          [style.prime]: status === "prime",
          [style.attack]: status === "attack",
          [style.charge]: status === "charge"
        })}
        src={getImage(char.sid, char.shiny, back)}
        alt={char.speciesName}
      />
    </div>
  )
}

export default Character