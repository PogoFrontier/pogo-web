import GameEndStatistic from '@components/gameEndStatistic/GameEndStatistic'
import LanguageContext from '@context/LanguageContext'
import classnames from 'classnames'
import style from './style.module.scss'
import { useContext } from 'react'

interface ModalProps {
  result: string
  gameEndData: MemberStatistics[] | null
  goHome: () => void
  rematch: () => void
}

interface MemberStatistics {
  name: string
  sid: number
  current: {
    hp: number
    energy: number
    damageDealt: number
    chargeMovesUsed: number
    timeSpendAlive: number
  }
}

const EndGameModal: React.FunctionComponent<ModalProps> = ({
  result,
  gameEndData,
  goHome,
  rematch,
}) => {
  const strings = useContext(LanguageContext).strings

  const getResult = (): string => {
    switch (result) {
      case 'won':
        return strings.result_win
      case 'lost':
        return strings.result_loss
      case 'tied':
        return strings.result_tie
      default:
        return strings.result_tie
    }
  }

  return (
    <div className={style.root}>
      <div className={style.modal}>
        <div className={style.head}>
          <span className={style.title}>{getResult()}</span>
          <div className={style.buttons}>
            <button
              className={classnames([
                style.button,
                'btn',
                'btn-primary',
                'noshrink',
              ])}
              onClick={rematch}
            >
              Rematch
            </button>
            <button
              className={classnames([
                style.button,
                'btn',
                'btn-negative',
                'noshrink',
              ])}
              onClick={goHome}
            >
              Exit
            </button>
          </div>
        </div>
        <div className={style.statistics}>
          <span className={style.details}>Details</span>
          {gameEndData &&
            gameEndData.map((statistics: MemberStatistics) => (
              <GameEndStatistic
                key={statistics.sid}
                name={statistics.name}
                sid={statistics.sid}
                chargeMovesUsed={statistics.current.chargeMovesUsed}
                timeSpendAlive={statistics.current.timeSpendAlive}
                damageDealt={statistics.current.damageDealt}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

export default EndGameModal
