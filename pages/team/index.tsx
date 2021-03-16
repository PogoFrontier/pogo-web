import Layout from '@components/layout/Layout'
import UserContext, { UserTeam } from '@context/UserContext'
import React, { useContext, useEffect, useState } from 'react'
import CraftTeam from '@components/craft_team/CraftTeam'
// import { updateUserTeam } from '@common/actions/userAPIActions'
import getMini from '@common/actions/getMini'
import Split from '@components/split/Split'
import { TabPanel } from '@reach/tabs'
import style from './style.module.scss'
import classnames from 'classnames'
import { TeamMember } from '@adibkhan/pogo-web-backend/team'
import Loader from 'react-loader-spinner'

interface ContentProps {
  meta: string
}

const Content: React.FC<ContentProps> = ({ meta }) => {
  const { user, setTeams } = useContext(UserContext)
  const [isCrafting, setIsCrafting] = useState(false)
  const [teamToEdit, setTeamToEdit] = useState<UserTeam | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(false)
  }, [teamToEdit])

  const updateTeam = (team: UserTeam) => {
    if (team.id) {
      const editIndex = user.teams.findIndex(x => x.id === team.id)
      if (editIndex > -1) {
        user.teams[editIndex] = team
      } else {
        user.teams.push(team)
      }
      setTeams(user.teams)
    }
  }

  const handleOnClickAddTeam = () => {
    setTeamToEdit(null)
    setIsCrafting(true)
  }

  const handleEditTeam = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const i = parseInt(e.currentTarget.value, 10)
    setTeamToEdit(user.teams[i])
    if (teamToEdit === null) {
      setIsLoading(true)
    }
    setIsCrafting(true)
  }

  const onExit = () => {
    setIsCrafting(false)
  }

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (window.confirm("You cannot undo this action. Are you sure you want to delete this team?")) {
      const i = parseInt(e.currentTarget.value, 10)
      user.teams.splice(i, 1)
      setTeams(user.teams)
    }
  }

  if (isLoading) {
    return <Loader
      type="TailSpin"
      color="#68BFF5"
      height={80}
      width={80}
    />
  }

  if (!user || !user.teams) {
    return <p>Please sign in to use the teambuilder</p>
  }

  if (isCrafting) {
    return (
      <div className={style.root}>
        {teamToEdit ? (
          <CraftTeam
            selectedMeta={meta}
            updateTeam={updateTeam}
            teamToEdit={teamToEdit}
            onExit={onExit}
          />
        ) : (
          <CraftTeam
            selectedMeta={meta}
            updateTeam={updateTeam}
            onExit={onExit}
          />
        )}
      </div>
    )
  }

  return (
    <div className={style.root}>
      {user.teams.length > 0 ? (
        user.teams.map((team: UserTeam, i: number) => {
          if (team.format === meta) {
            return (
              <div className={style.wrapper} key={team.id}>
                <button
                  className={style.box}
                  value={i}
                  onClick={handleEditTeam}
                >
                  <label className={style.label}>{team.name}</label>
                  <div className={style.members}>
                    {team.members.length > 0 &&
                      team.members.map((member: TeamMember, index: number) => (
                        <img
                          key={index}
                          src={getMini(member.sid)}
                          alt={member.speciesName}
                        />
                      ))}
                  </div>
                </button>
                <div className={style.btns}>
                  <button
                    value={i}
                    onClick={handleDelete}
                    className={classnames([style.btn, style.delete])}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          }
        })
      ) : (
        <p>No Teams to display</p>
      )}
      <button className="btn btn-primary" onClick={handleOnClickAddTeam}>
        Add Team
      </button>
    </div>
  )
}

const TeamPage = () => {
  // const { user } = useContext(UserContext)
  const [metas] = useState(['Great League', 'Ultra League', 'Master League'])
  const [index, setIndex] = useState(0)

  // useEffect(() => {
  //   if (user && metas) {
  //     const metaArr: string[] = [
  //       'Great League',
  //       'Ultra League',
  //       'Master League',
  //     ]
  //     user.teams.forEach((team: any) => {
  //       if (!metaArr.some((m) => m === team.meta)) metaArr.push(team.meta)
  //     })
  //   }
  // }, [user, metas])

  // const addMeta = () => {
  //   // open modal and add custom meta to list
  //   // eventually these metas and their rules should be stored on backend, useEffect to store them in state
  //   // they should also be part of the user object
  //   const newMetas = [...metas, 'Holiday Cup']
  //   setMetas(newMetas)
  //   setIndex(newMetas.length - 1) // will be whatever the new meta is
  //   // reset select value on close/submit of modal
  // }

  const tabs = metas.map((x) => (
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
        // buttonProps={{ title: "New Meta", onClick: addMeta }}
        tabProps={{ index, onChange, children: null }}
      >
        {tabs}
      </Split>
    </Layout>
  )
}

export default TeamPage
