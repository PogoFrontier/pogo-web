import { ListboxGroupLabel, ListboxGroup, ListboxOption } from '@reach/listbox'
import ImageHandler from '@common/actions/getImages'
import { TeamMember } from '@adibkhan/pogo-web-backend'

import style from './style.module.scss'
import { UserTeam } from '@context/UserContext'
import { useState } from 'react'

interface MetaGroupProps {
  meta: string
  teams: UserTeam[]
}

const MetaGroup: React.FC<MetaGroupProps> = ({ meta, teams }) => {
  const [visibility, setVisibility] = useState<boolean>(true)
  interface TeamOptionProps {
    team: TeamMember[]
    name: string
    id: string
  }
  const TeamOption: React.FC<TeamOptionProps> = ({ team, name, id }) => {
    const imagesHandler = new ImageHandler()
    return (
      <ListboxOption
        value={id}
        className={style.option}
        style={visibility ? { display: 'flex' } : { display: 'none' }}
      >
        <br />
        <div>
          {team.map((member: any, index: number) => (
            <img
              key={index}
              src={imagesHandler.getMini(member.sid)}
              className={style.member}
              alt={member.speciesName}
            />
          ))}
        </div>
        <strong>{name}</strong>
      </ListboxOption>
    )
  }
  const changeVisibility = () => {
    setVisibility((prev) => !prev)
  }
  return (
    <ListboxGroup className={style.metaGroup}>
      <div className={style.groupLabel} onClick={changeVisibility}>
        <ListboxGroupLabel>{meta}</ListboxGroupLabel>
        <span className={style.labelIcon}>{visibility ? 'X' : 'V'}</span>
      </div>
      {teams.map((x: { members: TeamMember[]; name: string; id: string }) => (
        <TeamOption team={x.members} name={x.name} id={x.id} key={x.id} />
      ))}
    </ListboxGroup>
  )
}

export default MetaGroup
