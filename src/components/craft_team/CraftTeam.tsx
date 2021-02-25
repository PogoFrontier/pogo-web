import React, { useEffect, useState } from 'react'
import TeamMemberSummary from '@components/team_member_summary/TeamMemberSummary'
import TeamMemberSelector from '@components/team_member_selector/TeamMemberSelector'
import getMini from '@common/actions/getMini'
import Input from '@components/input/Input'
import style from './craft.module.scss'
import classnames from 'classnames'

interface CraftTeamProps {
  selectedMeta: string
  teamToEdit?: any
  updateTeam: (team: any) => void
  onExit: () => void
}

const CraftTeam: React.FC<CraftTeamProps> = ({
  selectedMeta,
  teamToEdit,
  updateTeam,
  onExit
}) => {
  const [workingTeam, setWorkingTeam] = useState([] as any)
  const [selectedPokemon, setSelectedPokemon] = useState<any | null>(null)
  const [addingMember, setAddingMember] = useState(false)
  const [editingIndex, setEditingIndex] = useState(0)
  const [teamName, setTeamName] = useState('New Team')

  useEffect(() => {
    if (teamToEdit) {
      setupForEditing()
    } else if (!(workingTeam && workingTeam.length > 0)) {
      setAddingMember(true)
    }
  }, [])

  const setupForEditing = () => {
    const teamToEditCopy = { ...teamToEdit }
    setWorkingTeam(teamToEditCopy.members)
    setTeamName(teamToEditCopy.name)
    setSelectedPokemon(teamToEditCopy.members[0])
  }

  const handleSelectPokemon = (e: any) => {
    setSelectedPokemon(workingTeam[e.currentTarget.id])
    // setEditingIndex(Number(e.currentTarget.id));
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
    setWorkingTeam(newTeam)
    setSelectedPokemon(pokemon)
    setAddingMember(false)
  }

  const saveTeam = () => {
    // validate team here
    // include id if teamToEdit
    const name = teamName === '' ? 'New Team' : teamName
    const teamToUpdate =
      teamToEdit && teamToEdit.id
        ? {
            id: teamToEdit.id,
            name,
            format: selectedMeta,
            members: workingTeam,
          }
        : {
            name,
            format: selectedMeta,
            members: workingTeam,
          }
    updateTeam(teamToUpdate)
  }

  const handleTeamNameChange = (e: any) => {
    setTeamName(e.target.value)
  }

  const handleAddMemberClick = () => {
    setEditingIndex(workingTeam.length)
    setAddingMember(true)
  }

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
        {workingTeam && workingTeam.length > 0 && (
          <button className="btn btn-primary" onClick={saveTeam}>
            Save Team
          </button>
        )}
      </div>
      <div>
        {workingTeam && (
          <ul className={style.members}>
            {workingTeam.length > 0 &&
              workingTeam.map((member: any, index: any) => (
                <li
                  className={classnames([style.member, {[style.selected]: member === selectedPokemon}])}
                  key={index}
                  id={index}
                  onClick={handleSelectPokemon}
                >
                  <img src={getMini(member.sid)} alt={member.speciesName} />
                </li>
              ))}
            {workingTeam.length < 6 && (
              <li key="add-member">
                <a href="#" onClick={handleAddMemberClick}>
                  Add New
                </a>
              </li>
            )}
          </ul>
        )}
        {addingMember ? (
          <TeamMemberSelector
            cancelEdit={cancelEdit}
            savePokemon={savePokemon}
          />
        ) : selectedPokemon ? (
          <TeamMemberSummary member={selectedPokemon} />
        ) : null}
      </div>
    </div>
  )
}

export default CraftTeam
