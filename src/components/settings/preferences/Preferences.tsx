import LanguageContext, { supportedLanguages } from '@context/LanguageContext'
import SettingsContext from '@context/SettingsContext'
import { useContext, useState } from 'react'
import style from './preferences.module.scss'

const Preferences = () => {
  const settings = useContext(SettingsContext)
  const languageContext = useContext(LanguageContext)
  const [lang, setLang] = useState(settings.language)
  const handleChangeLanguage = async (event: any) => {
    settings.setLanguage(event.target.value)
    setLang(event.target.value)
  }
  const strings = languageContext.strings

  return (
    <div className={style.root}>
      <div className={style.settingsGroup}>
        <span className={style.settingsTitle}>{strings.language}</span>
        <select
          onChange={handleChangeLanguage}
          className={style.label}
          value={lang}
        >
          {supportedLanguages.map((l) => {
            return (
              <option value={l} key={l}>
                {l}
              </option>
            )
          })}
        </select>
      </div>
    </div>
  )
}

export default Preferences
