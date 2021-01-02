import getImage from "@common/actions/getImage"
import { TeamMember } from "@adibkhan/pogo-web-backend"
import classnames from 'classnames'
import style from './character.module.scss'
import getColor from "@common/actions/getColor"
import { useEffect, useState } from "react"
import { SERVER } from '@config/index'


export interface CharacterProps {
  status: "prime" | "attack" | "charge" | "switch" | "idle"
  char?: TeamMember
  back?: boolean
}

const Character: React.FunctionComponent<CharacterProps> = ({ char, back, status }) => {
  const [s, setS] = useState(status)
  const [cooldown, setCooldown] = useState(false);
  const [typeStyle, setTypeStyle] = useState(["normal", "normal"]);

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

  /**
   * @returns an array containing the types of charge moves
   * @param elem, index of the charge move in char.chargeMoves
   */
  async function getTypesStyle(){    
    let t: any[] = []
    await fetch(SERVER + "api/moves/" + char?.chargeMoves[0]).then(res => res.json().then(json =>{
      t.push(json.type)
    }))
    await fetch(SERVER + "api/moves/" + char?.chargeMoves[1]).then(res => res.json().then(json =>{
      t.push(json.type)
    }))
    console.log(t)
    setTypeStyle(t);
  }

  function ChargedButtons(){
    //returns empty div when character is from opponent
    if(back !== true) return <div></div>
    getTypesStyle()
    return (
      <div className={style.chargedButtons}> 
        <div className={style.chargeGroup}>
          <div className={classnames([style.chargeButton, style[typeStyle[0]]])}></div>
          <span className={style.label}>{char?.chargeMoves[0]}</span>
        </div>
        <div className={style.chargeGroup}>
          <div className={classnames([style.chargeButton, style[typeStyle[1]]])}></div>
          <span className={style.label}>{char?.chargeMoves[1]}</span>
        </div>
      </div>
     
    );
  }

  return (
    <div>
      <div className={style.healthbar}>
        <div
          className={style.health}
          style={{ width: `${ ratio * 100 }%`, backgroundColor: color }}
        />
      </div>
      <img
        className={classnames([style.char], [style[s]], { 
          [style.back]: back,
        })}
        src={getImage(char.sid, char.shiny, back)}
        alt={char.speciesName}
      />
      <ChargedButtons/>
      
    </div>
  )
}

export default Character