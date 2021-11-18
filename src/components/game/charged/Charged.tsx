import { Move } from '@adibkhan/pogo-web-backend'
import getKeyDescription from '@common/actions/getKeyDescription'
import { Icon, IconName } from '@components/icon/Icon'
import LanguageContext from '@context/LanguageContext'
import SettingsContext from '@context/SettingsContext'
import classnames from 'classnames'
import { forwardRef, RefObject, useContext } from 'react'
import style from './charged.module.scss'

interface ChargedButtonProps {
  move: Move
  energy: number
  onClick: (move: Move, index: number) => void
  keyboardInput: string | undefined
  index: number
  currentMove: string
  bufferedMove: string
  ref: RefObject<HTMLLabelElement>
}

interface ChargedProps {
  moves: Move[]
  energy: number
  onClick: (move: Move, index: number) => void
  currentMove: string
  bufferedMove: string
  refs: RefObject<HTMLButtonElement>[]
}

const ChargedButton = forwardRef<HTMLButtonElement, ChargedButtonProps>(
  (
    { move, energy, onClick, keyboardInput, index, currentMove, bufferedMove },
    ref
  ) => {
    const { current } = useContext(LanguageContext)
    const handleClick = (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      e.preventDefault()
      e.stopPropagation()
      onClick(move, index)
    }

    function evaluatePressed() {
      const search = `#ca:${index}`
      return currentMove === search || bufferedMove === search
    }

    const pressed = evaluatePressed()

    return (
      <div className={classnames([style.chargeGroup])}>
        {keyboardInput && (
          <label className={style.keylabel}>({keyboardInput})</label>
        )}
        <button
          ref={ref}
          onClick={handleClick}
          disabled={false}
          className={classnames([
            style.chargeButton,
            style[move.type],
            {
              [style.filled]: energy >= move.energy,
              [style.alternative]: energy >= move.energy * 2,
              [style.pressed]: pressed,
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
        <span className={style.label}>
          {move.name[current] || move.name.en}
        </span>
      </div>
    )
  }
)

const Charged: React.FunctionComponent<ChargedProps> = ({
  moves,
  onClick,
  energy,
  currentMove,
  bufferedMove,
  refs,
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
            ref={refs?.[index]}
            index={index}
            energy={energy}
            onClick={onClick}
            currentMove={currentMove}
            bufferedMove={bufferedMove}
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
