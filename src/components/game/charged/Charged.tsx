import { Move } from '@adibkhan/pogo-web-backend'
import { Icon, IconName } from '@components/icon/Icon'
import classnames from 'classnames'
import style from './charged.module.scss'
import SettingsContext from '@context/SettingsContext'
import { useContext } from 'react'
import getKeyDescription from '@common/actions/getKeyDescription'

interface ChargedButtonProps {
  move: Move
  energy: number
  onClick: (move: Move, index: number) => void
  keyboardInput: string | undefined,
  index: number
}

interface ChargedProps {
  moves: Move[]
  energy: number
  onClick: (move: Move, index: number) => void
}

const ChargedButton: React.FunctionComponent<ChargedButtonProps> = ({
  move,
  energy,
  onClick,
  keyboardInput,
  index
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    onClick(move, index)
  }

  return (
    <div
      className={classnames([
        style.chargeGroup,
        { 'no-click': energy < move.energy },
      ])}
    >
      {keyboardInput && (
        <label className={style.keylabel}>({keyboardInput})</label>
      )}
      <button
        onClick={handleClick}
        disabled={energy < move.energy}
        className={classnames([
          style.chargeButton,
          style[move.type],
          {
            [style.filled]: energy >= move.energy,
            [style.alternative]: energy >= move.energy * 2,
          },
        ])}
      >
        <div
          className={classnames([
            style.fill,
            style[move.type],
            style.filled,
            {
              [style.alternative]: energy >= move.energy,
            },
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

const Charged: React.FunctionComponent<ChargedProps> = ({
  moves,
  onClick,
  energy,
}) => {
  if (!moves || moves.length <= 0) {
    return null
  }

  const { showKeys, keys } = useContext(SettingsContext)
  const { charge1Key, charge2Key } = keys

  return (
    <div className={style.root}>
      {moves.map((x, index) => (
        <>
          <ChargedButton
            key={`${x.moveId}${index}`}
            move={x}
            index={index}
            energy={energy}
            onClick={onClick}
            keyboardInput={
              showKeys
                ? getKeyDescription(
                    [charge1Key, charge2Key][index]
                  ).toUpperCase()
                : undefined
            }
          />
        </>
      ))}
    </div>
  )
}

export default Charged
