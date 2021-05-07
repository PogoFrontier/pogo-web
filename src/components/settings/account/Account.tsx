import SettingsContext from '@context/SettingsContext'
import { useContext, useState } from 'react'
import style from './account.module.scss'

import { getStrings, languages } from '@trans/translations'

const Controls = () => {
  const clear = useContext(SettingsContext).clear
  const settings = useContext(SettingsContext)

  const [lang, setLang] = useState(settings.language)

  // useEffect to live update
  const strings = getStrings(lang)

  const handleChangeLanguage = (event: any) => {
    settings.setLanguage(event.target.value)
    setLang(event.target.value)
  }

  return (
    <div className={style.root}>
      <button className="btn btn-negative" onClick={clear}>
        {strings.clear_data}
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
