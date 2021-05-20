import { useContext, useState } from 'react'
import style from './account.module.scss'

import TranslationContext from '@context/TranslationContext'
import SettingsContext from '@context/SettingsContext'
import { getStrings, supportedLanguages } from '@common/actions/getLanguage'

const Controls = () => {
  const locale = useContext(TranslationContext)
  const settings = useContext(SettingsContext)
  const strings = locale.strings
  const [lang, setLang] = useState(settings.language)

  const handleChangeLanguage = async (event: any) => {
    settings.setLanguage(event.target.value)
    setLang(event.target.value)
    await getStrings(event.target.value).then(data => {
      locale.setStrings(data)
      console.log(data)
    })
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
