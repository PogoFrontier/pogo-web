import Layout from '@components/layout/Layout'
import UserContext from '@context/UserContext'
import React, { useContext, useEffect, useState } from 'react'
import CraftTeam from '@components/craft_team/CraftTeam'
import { updateUserTeam } from '@common/actions/userAPIActions'
import getMini from '@common/actions/getMini'

const teamPage = () => {
  const { user, refreshUser } = useContext(UserContext)
  const [metas, setMetas] = useState([
    'Great League',
    'Ultra League',
    'Master League',
  ])
  const [selectedMeta, setSelectedMeta] = useState('Great League')
  const [craftingTeam, setCraftingTeam] = useState(false)
  const [teamToEdit, setTeamToEdit] = useState<any | null>(null)

  useEffect(() => {
    if (user && metas) {
      const metaArr: string[] = [
        'Great League',
        'Ultra League',
        'Master League',
      ]
      user.teams.forEach((team: any) => {
        if (!metaArr.some((m) => m === team.meta)) metaArr.push(team.meta)
      })
    }
  }, [user, metas])

  const addMeta = () => {
    // open modal and add custom meta to list
    // eventually these metas and their rules should be stored on backend, useEffect to store them in state
    // they should also be part of the user object
    setMetas([...metas, 'Holiday Cup'])
    setCraftingTeam(false) // need this
    setSelectedMeta('Holiday Cup') // will be whatever the new meta is
    // reset select value on close/submit of modal
  }

  const updateTeam = (team: any) => {
    if (localStorage.getItem('token')) {
      const token: any = localStorage.getItem('token')
      updateUserTeam(team, token)
        .then((res) => {
          if (res.message) {
            // display success message too
            refreshUser()
            setCraftingTeam(false)
          }
        })
        .catch(() => {
          // console.log(err)
        })
    }
  }

  const handleMetaChange = (e: any) => {
    setCraftingTeam(false)
    e.target.value === 'add-meta' ? addMeta() : setSelectedMeta(e.target.value)
  }

  const handleOnClickAddTeam = () => {
    setCraftingTeam(true)
  }

  const handleEditTeam = (e: any) => {
    setTeamToEdit(user.teams[e.target.value])
    setCraftingTeam(true)
  }

  const handleSetSelectedMeta = (e: any) => {
    setSelectedMeta(e.target.value)
  }

  return (
    <Layout>
      {user && user.teams && (
        <div>
          <div className="side-meta-menu">
            <ul style={{ listStyleType: 'none' }}>
              {metas &&
                metas.map((meta: any) => (
                  <li key={meta} value={meta} onClick={handleSetSelectedMeta}>
                    {meta}
                  </li>
                ))}
              <li className="add-meta-button">
                <button onClick={addMeta}>Add New Meta</button>
              </li>
            </ul>
          </div>
          <div className="mobile-meta-menu">
            <select
              name="metas"
              id="metas"
              value={selectedMeta}
              onChange={handleMetaChange}
            >
              {metas &&
                metas.map((meta: any) => (
                  <option key={meta} value={meta}>
                    {meta}
                  </option>
                ))}
              <option value="add-meta">Add New Meta</option>
            </select>
          </div>
          {craftingTeam ? (
            <div className="crafting-team">
              {teamToEdit ? (
                <CraftTeam
                  selectedMeta={selectedMeta}
                  updateTeam={updateTeam}
                  teamToEdit={teamToEdit}
                />
              ) : (
                <CraftTeam
                  selectedMeta={selectedMeta}
                  updateTeam={updateTeam}
                />
              )}
            </div>
          ) : (
            <div className="team-list">
              {user.teams.length > 0 ? (
                user.teams.map((team: any, i: number) => {
                  if (team.format === selectedMeta) {
                    return (
                      <div className="team-item" key={team.id}>
                        <label className="team-name">{team.name}</label>
                        <div className="team-box">
                          {team.members.map((member: any, index: number) => (
                            <img
                              key={index}
                              src={getMini(member.sid)}
                              alt={member.speciesName}
                            />
                          ))}
                        </div>
                        <div className="team-btns">
                          <button value={i} onClick={handleEditTeam}>
                            Edit
                          </button>
                          <button>Delete</button>
                        </div>
                      </div>
                    )
                  }
                })
              ) : (
                <p>No Teams to display</p>
              )}
              <button onClick={handleOnClickAddTeam}>Add Team</button>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}

export default teamPage
