import React, { useEffect, useState } from 'react'
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
  const [id, setId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const imageHandler = new ImageHandler()

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
        metaMap[selectedMeta]!.name
      )
      if (result.message) {
        setError(result.message)
        setPopupTitle('Your team is invalid')
        setPopupButtons(undefined)
      } else {
        setError(' ')
        setPopupTitle('Your team is valid')
        setPopupButtons(undefined)
      }
    } else {
      setError(`Meta ${selectedMeta} doesn't exist`)
      setPopupTitle("Wait, what? That shouldn't happen.")
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
        metaMap[selectedMeta]!.name
      )
      if (result.message) {
        setError(result.message)
        setPopupTitle('Are you sure, you want to exit? Your team is invalid')
        setPopupButtons([
          {
            title: 'Exit anyway',
            onClick: onExit,
            className: 'btn btn-negative',
          },
          {
            title: 'Continue editing',
            onClick: onErrorPopupClose,
            className: 'btn btn-secondary',
          },
        ])
      } else {
        onExit()
      }
    } else {
      setError(`Meta ${selectedMeta} doesn't exist`)
      setPopupTitle("Wait, what? That shouldn't happen.")
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
      name = teamName === '' ? 'New Team' : teamName
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
        title="Name"
        type="text"
        value={teamName}
        placeholder="Team Name"
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
                <li
                  className={classnames([
                    style.member,
                    { [style.selected]: member === selectedPokemon },
                  ])}
                  key={index}
                  id={index}
                  onClick={handleSelectPokemon}
                >
                  <img
                    src={imageHandler.getMini(member.sid)}
                    alt={member.speciesName}
                  />
                </li>
              ))}
            {workingTeam.length < 6 && !addingMember && (
              <li key="add-member">
                <button
                  className="btn btn-primary"
                  onClick={handleAddMemberClick}
                  disabled={isLoading}
                >
                  Add New
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
        />
      </div>
    </div>
  )
}

export default CraftTeam
