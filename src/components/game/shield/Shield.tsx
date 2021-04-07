import { useContext } from 'react'
import getKeyDescription from '@common/actions/getKeyDescription'
import style from './shield.module.scss'
import SettingsContext from '@context/SettingsContext'

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
  return (
    <>
      {showKeys && !disabled && (
        <label className={style.keylabel}>
          ({getKeyDescription(shieldKey).toUpperCase()})
        </label>
      )}
      <button className="btn btn-primary" onClick={onClick} disabled={disabled}>
        {disabled ? 'Waiting...' : 'Shield?'}
      </button>
    </>
  )
}

export default Shield
