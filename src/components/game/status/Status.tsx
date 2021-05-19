import { TeamMember } from '@adibkhan/pogo-web-backend'
import style from './status.module.scss'
import TypeIcons from '@components/type_icon/TypeIcons'
import classnames from 'classnames'
import { useContext, useEffect, useState } from 'react'
import SettingsContext from '@context/SettingsContext'
import { getStrings } from '@trans/translations'
import { getPokemonNames } from '@common/actions/pokemonAPIActions'

interface StatusProps {
  subject: TeamMember
  shields: number
  remaining: number
}

const Status: React.FC<StatusProps> = ({ subject, shields, remaining }) => {
  const settings = useContext(SettingsContext)
  const strings = getStrings(settings.language)
  const [pokemonNames, setPokemonNames] = useState<any | null>(null)


  useEffect(() => {
    if(pokemonNames !== null) return
    getPokemonNames(undefined, undefined, undefined, undefined, undefined, settings.language).then(res => {
      setPokemonNames(res)
      console.log(res[subject.speciesId])
    })
    console.log('test')
  })

  return (
    <div className={style.root}>
      <TypeIcons types={subject.types} />
      <div className={style.container}>
        <div className={style.row}>
          <div
            className={classnames(style.shield, {
              [style.active]: 1 <= shields,
            })}
          />
          <div
            className={classnames(style.shield, {
              [style.active]: 2 <= shields,
            })}
          />
        </div>
        <div>
          <small>{strings.cp} {subject.cp}</small>
          <strong>{pokemonNames ? pokemonNames[subject.speciesId].speciesName : subject.speciesName}</strong>
        </div>
      </div>
      <div className={style.row}>
        <div
          className={classnames(style.pokeball, {
            [style.active]: 1 <= remaining,
          })}
        />
        <div
          className={classnames(style.pokeball, {
            [style.active]: 2 <= remaining,
          })}
        />
        <div
          className={classnames(style.pokeball, {
            [style.active]: 3 <= remaining,
          })}
        />
      </div>
    </div>
  )
}

export default Status
