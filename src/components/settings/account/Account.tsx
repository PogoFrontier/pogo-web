import SettingsContext from '@context/SettingsContext'
import { useContext } from 'react'
import style from './account.module.scss'

const Controls = () => {
  const clear = useContext(SettingsContext).clear

  return (
    <div className={style.root}>
      <button className="btn btn-negative" onClick={clear}>
        Clear Data
      </button>
    </div>
  )
}

export default Controls
