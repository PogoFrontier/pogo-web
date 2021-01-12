import { Move } from "@adibkhan/pogo-web-backend"
import { Icon, IconName } from "@components/icon/Icon"
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

const ChargedButton: React.FunctionComponent<ChargedButtonProps> = ({ move, energy, onClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    onClick(move.moveId)
  }

  return (
    <div className={style.chargeGroup}>
      <button
        onClick={handleClick}
        className={classnames([
          style.chargeButton,
          style[move.type],
          {
            [style.filled]: energy >= move.energy,
            [style.alternative]: energy >= move.energy * 2
          }
        ])}>
        <div
          className={
            classnames([
              style.fill,
              style[move.type],
              style.filled,
              {
                [style.alternative]: energy >= move.energy
              }
            ])}
            style={{ height: `${((energy / move.energy) * 100) % 100}%` }}
          />
        <div className={style.icon}>
          <Icon name={move.type as IconName} size="medium" />
        </div>
      </button>
      <span className={style.label}>{move.name}</span>
    </div>
  )
}

const Charged: React.FunctionComponent<ChargedProps> = ({ moves, onClick, energy }) => {
  if (!moves || moves.length <= 0) {
    return null
  }

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
