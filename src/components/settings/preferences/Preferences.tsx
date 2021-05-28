import { supportedLanguages } from '@context/LanguageContext'
import SettingsContext from '@context/SettingsContext'
import { useContext, useState } from 'react'
import style from './preferences.module.scss'

const Preferences = () => {
  const settings = useContext(SettingsContext)
  const [lang, setLang] = useState(settings.language)
  const handleChangeLanguage = async (event: any) => {
    settings.setLanguage(event.target.value)
    setLang(event.target.value)
  }

  return (
    <div className={style.root}>
      <select onChange={handleChangeLanguage} className={style.label} value={lang}>
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

export default Preferences
