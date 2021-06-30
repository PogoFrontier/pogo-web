import React, { useContext, useEffect, useState } from 'react'
import TeamMemberSelector from '@components/team_member_selector/TeamMemberSelector'
import ImageHandler from '@common/actions/getImages'
import Input from '@components/input/Input'
import style from './craft.module.scss'
import classnames from 'classnames'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import { v4 as uuidv4 } from 'uuid'
import { getValidateTeam } from '@common/actions/pokemonAPIActions'
import metaMap from '@common/actions/metaMap'
import Loader from 'react-loader-spinner'
import ErrorPopup from '@components/error_popup/ErrorPopup'
import LanguageContext from '@context/LanguageContext'
import SettingsContext from '@context/SettingsContext'
import TriangleTooltip from '@components/tooltip/TriangleTooltip'

interface CraftTeamProps {
  selectedMeta: string
  teamToEdit?: any
  updateTeam: (team: any) => void
  onExit: () => void
}

interface ButtonProps {
  title: string
  onClick: () => void
  className: string
}

const CraftTeam: React.FC<CraftTeamProps> = ({
  selectedMeta,
  teamToEdit,
  updateTeam,
  onExit,
}) => {
  const [workingTeam, setWorkingTeam] = useState([] as TeamMember[])
  const [selectedPokemon, setSelectedPokemon] = useState<any | null>(null)
  const [addingMember, setAddingMember] = useState(false)
  const [error, setError] = useState('')
  const [popupTitle, setPopupTitle] = useState('')
  const [popupButtons, setPopupButtons] = useState(
    undefined as ButtonProps[] | undefined
  )
  const [editingIndex, setEditingIndex] = useState(0)
  const [teamName, setTeamName] = useState('New Team')
  const [className, setClassName] = useState(
    metaMap[selectedMeta]?.classes?.[0]
  )
  const [id, setId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const imageHandler = new ImageHandler()

  const language = useContext(SettingsContext).language
  const strings = useContext(LanguageContext).strings

  const setupForEditing = () => {
    const teamToEditCopy = { ...teamToEdit }
    setWorkingTeam(teamToEditCopy.members)
    setTeamName(teamToEditCopy.name)
    setSelectedPokemon(teamToEditCopy.members[0])
    if (teamToEdit.id) {
      setId(teamToEdit.id)
    }
  }

  const handleSelectPokemon = (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    const index = parseInt(e.currentTarget.id, 10)
    setSelectedPokemon(workingTeam[index])
    setEditingIndex(index)
    setAddingMember(false)
  }

  const cancelEdit = () => {
    teamToEdit
      ? setSelectedPokemon(teamToEdit.members[0])
      : setAddingMember(true)
    setId('')
  }

  const handleValidate = async () => {
    // set loading if it needs too much time
    const timeout = setTimeout(() => setIsLoading(true), 1000)

    if (selectedMeta in metaMap) {
      const result = await getValidateTeam(
        JSON.stringify(workingTeam),
        metaMap[selectedMeta]!.name,
        language
      )
      if (result.message) {
        setError(result.message)
        setPopupTitle(strings.invalid_team)
        setPopupButtons(undefined)
      } else {
        setError(' ')
        setPopupTitle(strings.valid_team)
        setPopupButtons(undefined)
      }
    } else {
      setError(strings.meta_not_existing.replace('%1', selectedMeta))
      setPopupTitle(strings.not_possible)
      setPopupButtons(undefined)
    }

    clearTimeout(timeout)
    setIsLoading(false)
  }

  const handleExit = async () => {
    // set loading if it needs too much time
    const timeout = setTimeout(() => setIsLoading(true), 1000)

    if (selectedMeta in metaMap) {
      const result = await getValidateTeam(
        JSON.stringify(workingTeam),
        metaMap[selectedMeta]!.name,
        language
      )
      if (result.message) {
        setError(result.message)
        setPopupTitle(strings.exit_invalid_team)
        setPopupButtons([
          {
            title: strings.exit_anyway,
            onClick: onExit,
            className: 'btn btn-negative',
          },
          {
            title: strings.continue_edit,
            onClick: onErrorPopupClose,
            className: 'btn btn-secondary',
          },
        ])
      } else {
        onExit()
      }
    } else {
      setError(strings.meta_not_existing.replace('%1', selectedMeta))
      setPopupTitle(strings.not_possible)
      setPopupButtons(undefined)
    }

    clearTimeout(timeout)
    setIsLoading(false)
  }

  const savePokemon = async (pokemon: any) => {
    // validate pokemon before allowing save!
    const newTeam = [...workingTeam]
    newTeam[editingIndex] = pokemon
    setSelectedPokemon(pokemon)
    setWorkingTeam(newTeam)
    setAddingMember(false)
    saveTeam(newTeam)
  }

  const deletePokemon = () => {
    let newTeam = [...workingTeam]
    if (newTeam.length <= 1) {
      newTeam = []
    }
    newTeam.splice(editingIndex, 1)
    setSelectedPokemon(newTeam[0])
    setEditingIndex(0)
    setWorkingTeam(newTeam)
    setAddingMember(false)
  }

  const saveTeam = async (team?: TeamMember[], name?: string) => {
    if (!team) {
      team = workingTeam
    }

    if (!name) {
      name = teamName === '' ? strings.new_team : teamName
    }
    const newId: string = id === '' ? uuidv4() : id
    setId(newId)
    const teamToUpdate = {
      id: teamToEdit && teamToEdit.id ? teamToEdit.id : newId,
      name,
      format: selectedMeta,
      members: team,
    }
    updateTeam(teamToUpdate)
  }

  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamName(e.target.value)
    saveTeam(undefined, e.target.value)
  }

  const handleAddMemberClick = () => {
    setEditingIndex(workingTeam.length)
    setAddingMember(true)
    setSelectedPokemon(null)
  }

  const handleSetClassName = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClassName(e.target.value)
  }

  useEffect(() => {
    if (teamToEdit) {
      setupForEditing()
    } else if (!workingTeam || workingTeam.length <= 0) {
      setAddingMember(true)
    }
  }, [])

  function onErrorPopupClose() {
    setError('')
  }

  function classSelector(): React.ReactElement | null {
    if (className !== undefined) {
      return (
        <div className={style.label}>
          <label>FILTER SPECIES SEARCH BY CLASS</label>
          <select
            className="classNameSelector"
            name="class"
            id="class"
            onChange={handleSetClassName}
            value={className}
          >
            {metaMap[selectedMeta].classes!.map((val: string) => (
              <option value={val} key={val}>
                {val}
              </option>
            ))}
          </select>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      {!!error && (
        <ErrorPopup
          error={error}
          title={popupTitle}
          onClose={onErrorPopupClose}
          buttons={popupButtons}
        />
      )}
      {isLoading && (
        <Loader type="TailSpin" color="#68BFF5" height={80} width={80} />
      )}
      <Input
        title={strings.name}
        type="text"
        value={teamName}
        placeholder={strings.team_name}
        onChange={handleTeamNameChange}
      />
      <div className={style.btns}>
        <button
          className="btn btn-negative"
          onClick={handleExit}
          disabled={isLoading}
        >
          Exit
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleValidate}
          disabled={isLoading}
        >
          Validate
        </button>
      </div>
      <div>
        {workingTeam && (
          <ul className={style.members}>
            {workingTeam.length > 0 &&
              workingTeam.map((member: any, index: any) => (
                <TriangleTooltip
                  label={`${member.fastMove}, ${member.chargeMoves.join(', ')}`}
                  key={index}
                >
                  <li
                    className={classnames([
                      style.member,
                      { [style.selected]: member === selectedPokemon },
                    ])}
                    id={index}
                    onClick={handleSelectPokemon}
                  >
                    <img
                      src={imageHandler.getMini(member.sid)}
                      alt={member.speciesName}
                    />
                  </li>
                </TriangleTooltip>
              ))}
            {workingTeam.length < 6 && !addingMember && (
              <li key="add-member">
                <button
                  className="btn btn-primary"
                  onClick={handleAddMemberClick}
                  disabled={isLoading}
                >
                  {strings.add_new}
                </button>
              </li>
            )}
          </ul>
        )}
        <TeamMemberSelector
          cancelEdit={cancelEdit}
          savePokemon={savePokemon}
          member={selectedPokemon}
          deletePokemon={deletePokemon}
          meta={selectedMeta}
          position={editingIndex}
          metaClassName={className}
          classSelector={classSelector}
        />
      </div>
    </div>
  )
}

export default CraftTeam
