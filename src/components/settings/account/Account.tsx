import { useContext } from 'react'
import style from './account.module.scss'

import SettingsContext from '@context/SettingsContext'
import LanguageContext from '@context/LanguageContext'

const Controls = () => {
  const settings = useContext(SettingsContext)
  const strings = useContext(LanguageContext).strings
  
  return (
    <div className={style.root}>
      <button className="btn btn-negative" onClick={settings.clear}>
        {strings.clear_data}
      </button>
    </div>
  )
}

export default Controls
