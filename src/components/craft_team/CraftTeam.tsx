import React, { useEffect, useState } from 'react'
import TeamMemberSelector from '@components/team_member_selector/TeamMemberSelector'
import getMini from '@common/actions/getMini'
import Input from '@components/input/Input'
import style from './craft.module.scss'
import classnames from 'classnames'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import { v4 as uuidv4 } from 'uuid'
import { getValidateTeam } from '@common/actions/pokemonAPIActions'
import Loader from 'react-loader-spinner'

interface CraftTeamProps {
  selectedMeta: string
  teamToEdit?: any
  updateTeam: (team: any) => void
  onExit: () => void
}

const unsavedString = 'You have unsaved changes.'
const savedString = 'Save successful.'
const metaMap: {
  [key: string]: string,
 } = {
  'Great League': 'Great',
  'Ultra League': 'Ultra',
  'Master League': 'Master'
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
  const [editingIndex, setEditingIndex] = useState(0)
  const [teamName, setTeamName] = useState('New Team')
  const [isUnsaved, setIsUnsaved] = useState(false)
  const [message, setMessage] = useState('')
  const [id, setId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const setupForEditing = () => {
    const teamToEditCopy = { ...teamToEdit }
    setWorkingTeam(teamToEditCopy.members)
    setTeamName(teamToEditCopy.name)
    setSelectedPokemon(teamToEditCopy.members[0])
    if (teamToEdit.id) {
      setId(teamToEdit.id)
    }
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
    setId('')
  }

  const validateTeam = async (team: TeamMember[]): Promise<boolean> => {
    if (selectedMeta in metaMap) {
      const result = await getValidateTeam(JSON.stringify(team), metaMap[selectedMeta]!)
      if (result.message) {
        alert(result.message)
      } else {
        return true
      }
    }
    return false
  }

  const savePokemon = async (pokemon: any) => {
    // validate pokemon before allowing save!
    const newTeam = [ ...workingTeam ]
    newTeam[editingIndex] = pokemon
    setIsLoading(true)
    if (await validateTeam(newTeam)) {
      const equals = newTeam[editingIndex] === workingTeam[editingIndex]
      if (!equals) {
        setIsUnsaved(true)
        setMessage(unsavedString)
      }
      setSelectedPokemon(pokemon)
      setWorkingTeam(newTeam)
      setAddingMember(false)
    }
    setIsLoading(false)
  }

  const deletePokemon = () => {
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

  const saveTeam = async () => {
    setIsLoading(true)
    if (await validateTeam(workingTeam)) {
      const name = teamName === '' ? 'New Team' : teamName
      const newId: string = id === '' ? uuidv4() : id
      setId(newId)
      const teamToUpdate = {
        id: (teamToEdit && teamToEdit.id) ? teamToEdit.id : newId,
        name,
        format: selectedMeta,
        members: workingTeam,
      }
      updateTeam(teamToUpdate)
      setIsUnsaved(false)
      setMessage(savedString)
    }
    setIsLoading(false)
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
      {isLoading
        && <Loader
          type="TailSpin"
          color="#68BFF5"
          height={80}
          width={80}
        />
      }
      <Input
        title="Name"
        type="text"
        value={teamName}
        placeholder="Team Name"
        onChange={handleTeamNameChange}
      />
      <div className={style.btns}>
        <button className="btn btn-negative" onClick={onExit} disabled={isLoading}>
          Exit
        </button>
        {isUnsaved && !isLoading && (
          <button className="btn btn-primary" onClick={saveTeam} disabled={isLoading}>
            Save Team
          </button>
        )}
      </div>
      {message !== '' && <p className={message === savedString ? style.saved : style.error}>{message}</p>}
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
        />
      </div>
    </div>
  )
}

export default CraftTeam
