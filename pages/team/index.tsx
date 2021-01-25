import Layout from '@components/layout/Layout'
import UserContext from '@context/UserContext'
import React, { useContext, useEffect, useState } from 'react'
import CraftTeam from '@components/craft_team/CraftTeam'
import { updateUserTeam } from '@common/actions/userAPIActions'
import getMini from '@common/actions/getMini'
import Split from '@components/split/Split'
import { TabPanel } from '@reach/tabs'
import style from './style.module.scss'
import classnames from 'classnames'

interface ContentProps {
  meta: string
}

const Content: React.FC<ContentProps> = ({ meta }) => {
  const { user, refreshUser } = useContext(UserContext)
  const [craftingTeam, setCraftingTeam] = useState(false)
  const [teamToEdit, setTeamToEdit] = useState<any | null>(null)

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

  const handleOnClickAddTeam = () => {
    setTeamToEdit(null)
    setCraftingTeam(true)
  }

  const handleEditTeam = (e: any) => {
    setTeamToEdit(user.teams[e.target.value])
    setCraftingTeam(true)
  }

  const onExit = () => {
    setCraftingTeam(false)
  }

  if (!user || !user.teams) {
    return <p>Please sign in to use the teambuilder</p>
  }

  if (craftingTeam) {
    return (
      <div className={style.root}>
      {
        teamToEdit
        ? (
          <CraftTeam
            selectedMeta={meta}
            updateTeam={updateTeam}
            teamToEdit={teamToEdit}
            onExit={onExit}
          />
        )
        : (
          <CraftTeam
            selectedMeta={meta}
            updateTeam={updateTeam}
            onExit={onExit}
          />
        )
      }
    </div>
    )
  }

  return (
    <div className={style.root}>
      {
        user.teams.length > 0
        ? (
          user.teams.map((team: any, i: number) => {
            if (team.format === meta) {
              return (
                <div className={style.wrapper} key={team.id}>
                  <div className={style.box}>
                    <label className={style.label}>{team.name}</label>
                    <div className={style.members}>
                      {team.members.map((member: any, index: number) => (
                        <img
                          key={index}
                          src={getMini(member.sid)}
                          alt={member.speciesName}
                        />
                      ))}
                    </div>
                  </div>
                  <div className={style.btns}>
                    <button
                      value={i}
                      onClick={handleEditTeam}
                      className={classnames([style.btn, style.edit])}
                    >
                      Edit
                    </button>
                    <button
                      className={classnames([style.btn, style.delete])}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            }
          })
        )
        : <p>No Teams to display</p>
      }
      <button
        className="btn btn-primary"
        onClick={handleOnClickAddTeam}
      >
        Add Team
      </button>
    </div>
  )
}

const TeamPage = () => {
  const { user } = useContext(UserContext)
  const [ metas, setMetas ] = useState([
    'Great League',
    'Ultra League',
    'Master League',
  ])
  const [ index, setIndex ] = useState(0)

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
    const newMetas = [...metas, 'Holiday Cup']
    setMetas(newMetas)
    setIndex(newMetas.length - 1) // will be whatever the new meta is
    // reset select value on close/submit of modal
  }

  const tabs = metas.map(x => (
    <TabPanel key={x}>
      <Content meta={x} />
    </TabPanel>
  ))

  const onChange = (i: number) => {
    setIndex(i)
  }

  return (
    <Layout>
      <Split
        tabs={metas}
        buttonProps={{ title: "New Meta", onClick: addMeta }}
        tabProps={{ index, onChange, children: null }}
      >
        {tabs}
      </Split>
    </Layout>
  )
}

export default TeamPage
