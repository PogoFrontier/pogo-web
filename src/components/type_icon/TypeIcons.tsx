import style from './style.module.scss'
import classnames from 'classnames'
import { Icon, IconName } from '@components/icon/Icon'
import { typeId } from '@adibkhan/pogo-web-backend/team'

interface TypeIconProps {
  types: [typeId, typeId]
}

const TypeIcons: React.FC<TypeIconProps> = ({ types }) => {
  return (
    <div className={style.row}>
      {types.map((type) => {
        if (type !== 'none') {
          return (
            <div className={classnames([style.chargeButton, style[type]])}>
              <div className={style.icon}>
                <Icon name={type as IconName} size="small" />
              </div>
            </div>
          )
        }
      })}
    </div>
  )
}

export default TypeIcons
