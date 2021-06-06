import { TeamMember } from '@adibkhan/pogo-web-backend'
import ImageHandler from '@common/actions/getImages'
import { Icon } from '@components/icon/Icon'
import LanguageContext from '@context/LanguageContext'
import UserContext from '@context/UserContext'
import {
  ListboxButton,
  ListboxInput,
  ListboxList,
  ListboxOption,
  ListboxPopover,
  ListboxPopoverProps,
} from '@reach/listbox'
import React, { useContext } from 'react'
import style from './style.module.scss'

const TeamSelector = (props: { onSelect: (id: string) => void }) => {
  const { onSelect } = props

  const user = useContext(UserContext).user
  interface TeamOptionProps {
    team: TeamMember[]
    name: string
    id: string
    meta: string
  }
  const right: ListboxPopoverProps['position'] = (targetRect, popoverRect) => {
    const triggerCenter = targetRect!.left + targetRect!.width
    const left = triggerCenter - popoverRect!.width
    const maxLeft = window.innerWidth - popoverRect!.width - 2
    return {
      left: Math.min(Math.max(2, left), maxLeft) + window.scrollX,
      top: targetRect!.bottom + 8 + window.scrollY,
    }
  }
  const strings = useContext(LanguageContext).strings

  const TeamOption: React.FC<TeamOptionProps> = ({ team, name, id, meta }) => {
    const imagesHandler = new ImageHandler()
    return (
      <ListboxOption value={id} className={style.option}>
        <strong>{name + meta}</strong>
        <br />
        {team.map((member: any, index: number) => (
          <img
            key={index}
            src={imagesHandler.getMini(member.sid)}
            className={style.member}
            alt={member.speciesName}
          />
        ))}
      </ListboxOption>
    )
  }
  return (
    <ListboxInput
      aria-label={strings.select_team}
      onChange={onSelect}
      className={style.listbox}
      defaultValue="defaultTeam"
    >
      <div className={style.changeWrap}>
        <ListboxButton className={style.changeTeam}>
          <Icon name="down" />
        </ListboxButton>
        <small>{strings.change_team}</small>
      </div>
      <ListboxPopover className={style.popover} position={right}>
        <ListboxList>
          {user && user.teams && user.teams.length > 0 ? (
            user.teams.map((x) => (
              <TeamOption
                team={x.members}
                name={x.name}
                id={x.id}
                key={x.id}
                meta={x.format}
              />
            ))
          ) : (
            <p className={style.noteams}>{strings.team_not_available}</p>
          )}
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  )
}

export default TeamSelector
