import { TeamMember } from '@adibkhan/pogo-web-backend'
import { Icon } from '@components/icon/Icon'
import LanguageContext from '@context/LanguageContext'
import Input from '@components/input/Input'
import UserContext, { UserTeam } from '@context/UserContext'
import {
  ListboxButton,
  ListboxInput,
  ListboxList,
  ListboxPopover,
  ListboxPopoverProps,
} from '@reach/listbox'
import React, { useContext, useState } from 'react'
import MetaGroup from './MetaGroup'
import style from './style.module.scss'
import metaMap from '@common/actions/metaMap'

interface TeamSelectorProps {
  onSelect: (id: string) => void
  formatFilter?: string
}

const TeamSelector = (props: TeamSelectorProps) => {
  const { onSelect, formatFilter } = props
  const user = useContext(UserContext).user
  const strings = useContext(LanguageContext).strings
  const [metaVisibility, setMetaVisibility] = useState([])
  const [userInput, setUserInput] = useState('')

  const onChange = (e: any) => {
    const input = e.target.value.toLowerCase()
    setUserInput(input)
  }

  const right: ListboxPopoverProps['position'] = (
    targetRect: any,
    popoverRect: any
  ) => {
    const triggerCenter = targetRect!.left + targetRect!.width
    const left = triggerCenter - popoverRect!.width
    const maxLeft = window.innerWidth - popoverRect!.width - 2
    return {
      left: Math.min(Math.max(2, left), maxLeft) + window.scrollX,
      top: targetRect!.bottom + 8 + window.scrollY,
    }
  }

  const getFilteredTeams = () => {
    let filteredTeams: UserTeam[] = user.teams
    filteredTeams = filteredTeams.filter((team: UserTeam) => {
      // Does it not match the format fiter?
      if (formatFilter && team.format !== formatFilter) {
        return false
      }

      // Is all string?
      if (userInput === 'all' || userInput === '@all') {
        return true
      }

      // Is substring of teamName?
      if (team.name.toLowerCase().indexOf(userInput) > -1) {
        return true
      }

      // Is substring of meta
      if (team.format.toLowerCase().indexOf(userInput) > -1) {
        return true
      }

      // Is substring of a teamMember TODO: add translation for TeamMembers
      for (const member of team.members) {
        if (
          (member.speciesName as string).toLowerCase().indexOf(userInput) > -1
        ) {
          return true
        }
      }
      return false
    })
    return filteredTeams
  }

  const getTeamsPerMeta = () => {
    const sortedTeams: { meta?: TeamMember[] } = {}
    const filteredTeams = getFilteredTeams()
    filteredTeams.forEach((team: UserTeam) => {
      sortedTeams[team.format]
        ? sortedTeams[team.format].push(team)
        : (sortedTeams[team.format] = [team])
      if (!metaVisibility[team.format]) {
        setMetaVisibility((prev) => ({ ...prev, [team.format]: 'none' }))
      }
    })
    return sortedTeams
  }

  const getTeams = () => {
    const elements = []
    const sortedTeams = getTeamsPerMeta()
    for (const meta of Object.keys(sortedTeams)) {
      if (metaMap[meta]) {
        elements.push(
          <MetaGroup
            key={meta}
            meta={metaMap[meta]?.name}
            teams={sortedTeams[meta]}
          />
        )
      }
    }
    for (const randomMeta of Object.keys(metaMap).filter(
      (meta) => metaMap[meta].random
    )) {
      elements.push(
        <MetaGroup
          key={randomMeta}
          meta={metaMap[randomMeta].name}
          teams={[
            {
              name: 'random',
              id: 'randomMeta:' + randomMeta,
              format: randomMeta,
              members: [],
            },
          ]}
        />
      )
    }
    return elements
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
        <div className={style.searchbar}>
          <Input
            title="Species"
            type="text"
            placeholder={strings.teamSearch}
            onChange={onChange}
            value={userInput}
          />
        </div>
        <ListboxList>
          {user && user.teams && user.teams.length > 0 ? (
            getTeams()
          ) : (
            <p className={style.noteams}>{strings.team_not_available}</p>
          )}
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  )
}

export default TeamSelector
