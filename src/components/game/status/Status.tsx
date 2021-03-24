import { TeamMember } from '@adibkhan/pogo-web-backend'
import style from './status.module.scss'
import TypeIcons from '@components/type_icon/TypeIcons'
import classnames from 'classnames'

interface StatusProps {
  subject: TeamMember
  shields: number
  remaining: number
}

const Status: React.FC<StatusProps> = ({ subject, shields, remaining }) => {
  return (
    <div className={style.root}>
      <TypeIcons types={subject.types} />
      <div className={style.container}>
        <div className={style.row}>
          <div
            className={classnames(style.shield, {
              [style.active]: 1 <= shields,
            })}
          />
          <div
            className={classnames(style.shield, {
              [style.active]: 2 <= shields,
            })}
          />
        </div>
        <div>
          <small>CP {subject.cp}</small>
          <strong>{subject.speciesName}</strong>
        </div>
      </div>
      <div className={style.row}>
        <div
          className={classnames(style.pokeball, {
            [style.active]: 1 <= remaining,
          })}
        />
        <div
          className={classnames(style.pokeball, {
            [style.active]: 2 <= remaining,
          })}
        />
        <div
          className={classnames(style.pokeball, {
            [style.active]: 3 <= remaining,
          })}
        />
      </div>
    </div>
  )
}

export default Status
