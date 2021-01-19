import React, { useEffect, useState } from 'react'
import { SERVER } from '@config/index'
import TeamMemberSummary from '@components/team_member_summary/TeamMemberSummary'
import TeamMemberSelector from '@components/team_member_selector/TeamMemberSelector'

const CraftTeam = (props: {
  selectedMeta: string
  teamToEdit?: any
  updateTeam: (team: any) => void
}) => {
  const { selectedMeta, teamToEdit, updateTeam } = props
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
    // setEditingIndex(workingTeam.indexOf(member)); only do this when they hit the edit button
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
      <h3>
        {selectedMeta} Team:{' '}
        <input
          type="text"
          value={teamName}
          placeholder="Team Name"
          onChange={handleTeamNameChange}
        />
      </h3>
      <div className="choice-btns">
        {workingTeam && workingTeam.length > 0 && (
          <button className="save-btn" onClick={saveTeam}>
            Save Team
          </button>
        )}
      </div>
      <div className="team-members">
        {workingTeam && (
          <ul className="team-tabs" style={{ listStyleType: 'none' }}>
            {workingTeam.length > 0 &&
              workingTeam.map((member: any, index: any) => (
                <li key={index} id={index} onClick={handleSelectPokemon}>
                  <img
                    src={`${SERVER}/mini/${member.sid}.png`}
                    alt={member.speciesName}
                  />
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
