import { Move } from "@adibkhan/pogo-web-backend"
import classnames from "classnames"
import style from './charged.module.scss'

interface ChargedProps {
  moves: Move[],
  energy: number,
  onPress: (moveId: string) => void
}

const Charged: React.FunctionComponent<ChargedProps> = ({ moves }) => {
  /**
   * @returns an array containing the types of charge moves
   * @param elem, index of the charge move in char.chargeMoves
   */
  // const getTypesStyle = () => {    
  //   const t = ["normal", "normal"]
  //   Promise.all([
  //     fetch(SERVER + "api/moves/" + moves[0]?.name).then(res => res.json().then(json =>{
  //       t[0] = json.type
  //     })),
  //     fetch(SERVER + "api/moves/" + moves[1]?.name).then(res => res.json().then(json =>{
  //       t[1] = json.type
  //     }))
  //   ])
  //   .then(() => setTypeStyle(t))
  // }

  const move1 = moves[0]
  const move2 = moves[1]

  return (
    <div className={style.root}> 
      <div className={style.chargeGroup}>
        <div className={classnames([style.chargeButton, style[move1.type]])}/>
        <span className={style.label}>{move1.name}</span>
      </div>
      {
        move2 &&
        (
          <div className={style.chargeGroup}>
            <div className={classnames([style.chargeButton, style[move2.type]])}/>
            <span className={style.label}>{move2.name}</span>
          </div>
        )
      }
    </div>
  );
}

export default Charged
