import React, { useEffect, useState } from 'react'
import TeamMemberSelector from '@components/team_member_selector/TeamMemberSelector'
import getMini from '@common/actions/getMini'
import Input from '@components/input/Input'
import style from './craft.module.scss'
import classnames from 'classnames'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import { v4 as uuidv4 } from 'uuid'

interface CraftTeamProps {
  selectedMeta: string
  teamToEdit?: any
  updateTeam: (team: any) => void
  onExit: () => void
}

const unsavedString = 'You have unsaved changes.'
const savedString = 'Save successful.'

const CraftTeam: React.FC<CraftTeamProps> = ({
  selectedMeta,
  teamToEdit,
  updateTeam,
  onExit,
}) => {
  const [workingTeam, setWorkingTeam] = useState([] as TeamMember[])
  const [selectedPokemon, setSelectedPokemon] = useState<any | null>(null)
  const [addingMember, setAddingMember] = useState(false)
  const [editingIndex, setEditingIndex] = useState(0)
  const [teamName, setTeamName] = useState('New Team')
  const [isUnsaved, setIsUnsaved] = useState(false)
  const [message, setMessage] = useState('')

  const setupForEditing = () => {
    const teamToEditCopy = { ...teamToEdit }
    setWorkingTeam(teamToEditCopy.members)
    setTeamName(teamToEditCopy.name)
    setSelectedPokemon(teamToEditCopy.members[0])
  }

  const handleSelectPokemon = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    const index = parseInt(e.currentTarget.id, 10)
    setSelectedPokemon(workingTeam[index])
    setEditingIndex(index)
    setAddingMember(false)
  }

  const cancelEdit = () => {
    teamToEdit
      ? setSelectedPokemon(teamToEdit.members[0])
      : setAddingMember(true)
  }

  const savePokemon = (pokemon: any) => {
    // validate pokemon before allowing save!
    const newTeam = [...workingTeam]
    newTeam[editingIndex] = pokemon
    setSelectedPokemon(pokemon)
    setWorkingTeam(newTeam)
    setIsUnsaved(true)
    setMessage(unsavedString)
    setAddingMember(false)
  }

  const deletePokemon = () => {
    // validate pokemon before allowing save!
    let newTeam = [...workingTeam]
    if (newTeam.length <= 1) {
      newTeam = []
    }
    newTeam.splice(editingIndex, 1)
    setSelectedPokemon(newTeam[0])
    setWorkingTeam(newTeam)
    setIsUnsaved(true)
    setMessage(unsavedString)
    setAddingMember(false)
  }

  const saveTeam = () => {
    // validate team here
    // include id if teamToEdit
    const name = teamName === '' ? 'New Team' : teamName
    const id: string = uuidv4()
    const teamToUpdate = {
      id: (teamToEdit && teamToEdit.id) ? teamToEdit.id : id,
      name,
      format: selectedMeta,
      members: workingTeam,
    }
    updateTeam(teamToUpdate)
    setIsUnsaved(false)
    setMessage(savedString)
  }

  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUnsaved(true)
    setMessage(unsavedString)
    setTeamName(e.target.value)
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

  return (
    <div>
      <Input
        title="Name"
        type="text"
        value={teamName}
        placeholder="Team Name"
        onChange={handleTeamNameChange}
      />
      <div className={style.btns}>
        <button className="btn btn-negative" onClick={onExit}>
          Exit
        </button>
        {isUnsaved && (
          <button className="btn btn-primary" onClick={saveTeam}>
            Save Team
          </button>
        )}
      </div>
      <p>{message}</p>
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
                  <img src={getMini(member.sid)} alt={member.speciesName} />
                </li>
              ))}
            {workingTeam.length < 6 && !addingMember && (
              <li key="add-member">
                <button
                  className="btn btn-primary"
                  onClick={handleAddMemberClick}
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
        />
      </div>
    </div>
  )
}

export default CraftTeam
