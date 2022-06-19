import style from './style.module.scss'
import ImageHandler from '@common/actions/getImages'
import { useContext } from 'react'
import LanguageContext from '@context/LanguageContext'

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
  const strings = useContext(LanguageContext).strings

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
        <label className={style.statTitle}>{strings.time_spent_active}</label>
        <label className={style.statValue}>
          {Math.round(timeSpendAlive / 1000) + strings.abbr_seconds}
        </label>
      </div>
      <div className={style.stat}>
        <label className={style.statTitle}>{strings.charge_moves_used}</label>
        <label className={style.statValue}>{chargeMovesUsed}</label>
      </div>
      <div className={style.stat}>
        <label className={style.statTitle}>{strings.damage_dealt}</label>
        <label className={style.statValue}>{Math.round(damageDealt)}</label>
      </div>
    </div>
  )
}

export default GameEndStatistic
