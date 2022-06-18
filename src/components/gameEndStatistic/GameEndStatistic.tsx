import style from './style.module.scss'
import ImageHandler from '@common/actions/getImages'

interface GameEndStatisticsProps {
  sid: number
  name: string
  chargeMovesUsed: number
  timeSpendAlive: number
  damageDealt: number
}

const GameEndStatistic: React.FunctionComponent<GameEndStatisticsProps> = ({
  sid,
  name,
  chargeMovesUsed,
  timeSpendAlive,
  damageDealt,
}) => {
  const imageHandler = new ImageHandler()

  return (
    <div className={style.root}>
      <img
        className={style.sprite}
        src={imageHandler.getMini(sid, 'M')}
        alt={name}
      />
      <div className={style.stat}>
        <label className={style.statTitle}>{name}</label>
      </div>
      <div className={style.stat}>
        <label className={style.statTitle}>Time spent active</label>
        <label className={style.statValue}>
          {Math.round(timeSpendAlive / 1000)}s
        </label>
      </div>
      <div className={style.stat}>
        <label className={style.statTitle}>Charge moves used</label>
        <label className={style.statValue}>{chargeMovesUsed}</label>
      </div>
      <div className={style.stat}>
        <label className={style.statTitle}>Damage dealt</label>
        <label className={style.statValue}>{Math.round(damageDealt)}</label>
      </div>
    </div>
  )
}

export default GameEndStatistic
