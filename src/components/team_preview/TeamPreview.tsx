import React, { useContext } from 'react'
import style from './style.module.scss'
import TeamContext from '@context/TeamContext'
import ImageHandler from '@common/actions/getImages'
import metaMap from '@common/actions/metaMap'
import LanguageContext from '@context/LanguageContext'
import { StringsType } from '@common/actions/getLanguage'


function truncateString(str: string, num: number) {
  if (str.length > num) {
    return str.slice(0, num) + '...'
  } else {
    return str
  }
}

const TeamPreview = () => {
  const { team } = useContext(TeamContext)
  const imagesHandler = new ImageHandler()
  const strings: StringsType = useContext(LanguageContext).strings

  return (<div className={style.teamPreview}>
      <div>
        <p className={style.teamTitle}>
          <strong>
            {team.name
              ? truncateString(team.name, 8)
              : strings.your_team}{' '}
            /{' '}
          </strong>
          {team.format ? metaMap[team.format].name : ''}
        </p>
        <div className={style.members}>
          {team &&
            team.members &&
            team.members.map((member: any, index: number) => (
              <img
                key={index}
                className={style.member}
                src={imagesHandler.getMini(member.sid)}
                alt={member.speciesName}
              />
            ))}
        </div>
      </div>
    </div>)
}

export default TeamPreview
