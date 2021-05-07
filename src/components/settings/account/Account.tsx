import SettingsContext from '@context/SettingsContext'
import { useContext, useState } from 'react'
import style from './account.module.scss'

import { languages } from '@trans/translations'

const Controls = () => {
  const clear = useContext(SettingsContext).clear
  const settings = useContext(SettingsContext)

  const [lang, setLang] = useState(settings.language)

  const handleChangeLanguage = (event: any) => {
    settings.setLanguage(event.target.value)
    setLang(event.target.value)
  }

  return (
    <div className={style.root}>
      <button className="btn btn-negative" onClick={clear}>
        Clear Data
      </button>

      <select onChange={handleChangeLanguage} value={lang}>
        {languages.map((l) => {
          return (
            <option value={l} key={l}>
              {l}
            </option>
          )
        })}
      </select>
    </div>
  )
}

export default Controls
