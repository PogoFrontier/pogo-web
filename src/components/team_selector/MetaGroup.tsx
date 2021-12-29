import { ListboxGroupLabel, ListboxGroup, ListboxOption } from '@reach/listbox'
import ImageHandler from '@common/actions/getImages'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import { Icon } from '@components/icon/Icon'

import style from './style.module.scss'
import { UserTeam } from '@context/UserContext'
import React, { useState, useContext } from 'react'
import metaMap from '@common/actions/metaMap'
import TriangleTooltip from '@components/tooltip/TriangleTooltip'
import LanguageContext from '@context/LanguageContext'

interface MetaGroupProps {
  meta: string
  teams: UserTeam[]
}

const MetaGroup: React.FC<MetaGroupProps> = ({ meta, teams }) => {
  const [visibility, setVisibility] = useState<boolean>(true)
  const strings = useContext(LanguageContext).strings
  interface TeamOptionProps {
    team: TeamMember[]
    name: string
    id: string
  }
  const TeamOption: React.FC<TeamOptionProps> = ({ team, name, id }) => {
    const imagesHandler = new ImageHandler()
    const isRandom = !!metaMap[meta]?.random

    return (
      <ListboxOption
        value={id}
        className={style.option}
        style={visibility ? { display: 'flex' } : { display: 'none' }}
      >
        <br />
        <div className={style.teamMembers}>
          {isRandom ||
            team.map((member: any, index: number) => (
              <img
                key={index}
                src={imagesHandler.getMini(member.sid, member.gender)}
                className={style.member}
                alt={member.speciesName}
              />
            ))}
          {isRandom &&
            [1, 1, 1, 1, 1, 1].map((_, i) => (
              <img
                key={i}
                src={imagesHandler.getQuestionmark()}
                className={style.member}
                alt={'random member'}
              />
            ))}
        </div>
        <strong className={style.teamName}>{name}</strong>
      </ListboxOption>
    )
  }
  const changeVisibility = () => {
    setVisibility((prev) => !prev)
  }
  return (
    <ListboxGroup className={style.metaGroup}>
      <div className={style.groupLabel} onClick={changeVisibility}>
        <ListboxGroupLabel>
          {// Show tooltip if the meta is autorekt
          meta === 'Autorekt' ? (
            <div className={style.metaGroupLabel}>
              <span>{meta}</span>
              <TriangleTooltip label={strings.autorekt_tooltip}>
                <div>
                  <Icon name={'question'} />
                </div>
              </TriangleTooltip>
              <Icon name={visibility ? 'up' : 'down'} />
            </div>
          ) : (
            <div className={style.metaGroupLabel}>
              <span>{meta}</span>
              <Icon name={visibility ? 'up' : 'down'} />
            </div>
          )}
        </ListboxGroupLabel>
      </div>
      {teams.map((x: { members: TeamMember[]; name: string; id: string }) => (
        <TeamOption team={x.members} name={x.name} id={x.id} key={x.id} />
      ))}
    </ListboxGroup>
  )
}

export default MetaGroup
