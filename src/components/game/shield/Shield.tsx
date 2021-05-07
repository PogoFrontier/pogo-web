import { useContext } from 'react'
import getKeyDescription from '@common/actions/getKeyDescription'
import style from './shield.module.scss'
import SettingsContext from '@context/SettingsContext'
import { getStrings } from '@trans/translations'

interface ShieldProps {
  value: boolean
  onShield: () => void
  shields: number
}

const Shield: React.FC<ShieldProps> = ({ value, onShield, shields }) => {
  const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    onShield()
  }
  const { showKeys, keys } = useContext(SettingsContext)
  const { shieldKey } = keys

  const disabled = value || shields <= 0

  const settings = useContext(SettingsContext)
  const strings = getStrings(settings.language)

  return (
    <>
      {showKeys && !disabled && (
        <label className={style.keylabel}>
          ({getKeyDescription(shieldKey).toUpperCase()})
        </label>
      )}
      <button className="btn btn-primary" onClick={onClick} disabled={disabled}>
        {disabled ? strings.waiting : strings.shield_question}
      </button>
    </>
  )
}

export default Shield
