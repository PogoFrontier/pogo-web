import { useContext, useState } from 'react'
import style from './account.module.scss'

import SettingsContext from '@context/SettingsContext'
import LanguageContext, { supportedLanguages } from '@context/LanguageContext'

const Controls = () => {
  const settings = useContext(SettingsContext)
  const strings = useContext(LanguageContext).strings
  const [lang, setLang] = useState(settings.language)

  const handleChangeLanguage = async (event: any) => {
    settings.setLanguage(event.target.value)
    setLang(event.target.value)
  }

  return (
    <div className={style.root}>
      <button className="btn btn-negative" onClick={settings.clear}>
        {strings.clear_data}
      </button>

      <select onChange={handleChangeLanguage} value={lang}>
        {supportedLanguages.map((l) => {
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
