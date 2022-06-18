import GameEndStatistic from '@components/gameEndStatistic/GameEndStatistic'
import classnames from 'classnames'
import style from './style.module.scss'

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
  return (
    <div className={style.root}>
      <div className={style.modal}>
        <div className={style.head}>
          <span className={style.title}>You {result || 'Undefined'}</span>
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
