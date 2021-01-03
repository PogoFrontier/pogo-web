import { Move } from "@adibkhan/pogo-web-backend"
import classnames from "classnames"
import style from './charged.module.scss'

interface ChargedButtonProps {
  move: Move,
  energy: number,
  onClick: (moveId: string) => void
}

interface ChargedProps {
  moves: Move[],
  energy: number,
  onClick: (moveId: string) => void
}

const ChargedButton: React.FunctionComponent<ChargedButtonProps> = ({ move, onClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    onClick(move.moveId)
  }

  return (
    <div className={style.chargeGroup}>
      <button onClick={handleClick} className={classnames([style.chargeButton, style[move.type]])}/>
      <span className={style.label}>{move.name}</span>
    </div>
  )
}

const Charged: React.FunctionComponent<ChargedProps> = ({ moves, onClick, energy }) => {
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

  return (
    <div className={style.root}>
      {
        moves.map(x => (
          <ChargedButton
            key={x.moveId}
            move={x}
            energy={energy}
            onClick={onClick}
          />
        ))
      }
    </div>
  );
}

export default Charged
