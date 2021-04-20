import Layout from '@components/layout/Layout'
import UserContext, { UserTeam } from '@context/UserContext'
import React, { useContext, useEffect, useState } from 'react'
import CraftTeam from '@components/craft_team/CraftTeam'
// import { updateUserTeam } from '@common/actions/userAPIActions'
import ImageHandler from '@common/actions/getImages'
import Split from '@components/split/Split'
import { TabPanel } from '@reach/tabs'
import style from './style.module.scss'
import classnames from 'classnames'
import { TeamMember, Rule } from '@adibkhan/pogo-web-backend'
import Loader from 'react-loader-spinner'
import TeamContext from '@context/TeamContext'
import getRandomPokemon from '@common/actions/getRandomPokemon'
import { parseToRule } from '@common/actions/pokemonAPIActions'
import getCP from '@common/actions/getCP'

interface ContentProps {
  meta: string
}

const Content: React.FC<ContentProps> = ({ meta }) => {
  const { user, setTeams } = useContext(UserContext)
  const [isCrafting, setIsCrafting] = useState(false)
  const [teamToEdit, setTeamToEdit] = useState<UserTeam | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const imagesHandler = new ImageHandler()
  const { team, setTeam } = useContext(TeamContext)

  useEffect(() => {
    setIsLoading(false)
  }, [teamToEdit])

  const updateTeam = (newteam: UserTeam) => {
    if (newteam.id) {
      const editIndex = user.teams.findIndex((x) => x.id === newteam.id)
      if (editIndex > -1) {
        user.teams[editIndex] = newteam
      } else {
        user.teams.push(newteam)
      }

      if (team && team.id === newteam.id) {
        setTeam(newteam)
      }

      setTeams(user.teams)
    }
  }

  /**
   * Adds a Random Team to the userTeams
   */
  async function handleOnClickAddRandomTeam() {
    let rule: Rule
    const t: TeamMember[] = []
    const dexNrs = new Set()
    const types = new Set()
    const IDs = new Set()
    let hasMega = false
    await parseToRule(meta).then((data) => {
      rule = data
      if (rule === undefined) {
        alert('An unexpected error occured')
        return
      }
    })
    for (let i = 0; i < 6; i++) {
      let pokemon: TeamMember
      await getRandomPokemon(meta).then((data) => {
        if (data === undefined) {
          alert('An unexpected error occured')
          return
        }
        pokemon = data
        let canPush = true

        // check for bestbuddy rule
        if (pokemon.level > 50) {
          if (rule.maxBestBuddy > 0) rule.maxBestBuddy--
          else {
            // set pokemon to level 50 and recalculate stats
            pokemon.level = 50
            pokemon.cp = getCP(
              {
                atk: pokemon.atk,
                def: pokemon.def,
                hp: pokemon.hp,
              },
              [50, pokemon.iv.atk, pokemon.iv.def, pokemon.iv.hp]
            )
          }
        }

        // check for duplicate pokemons rule
        if (rule.flags?.speciesClauseByDex) {
          if (dexNrs.has(data.dex)) {
            canPush = false
          }
          if (rule.flags?.speciesClauseByForm && IDs.has(pokemon.speciesId)) {
            canPush = false
          }
        }

        // check for duplicate types
        if (
          rule.flags?.typeClause !== undefined &&
          rule.flags.typeClause &&
          (types.has(pokemon.types[0]) ||
            (pokemon.types.length > 1 && types.has(pokemon.types[1])))
        ) {
          canPush = false
        }

        // harcoded check for megas
        if (pokemon.speciesName?.toLowerCase().includes('mega') && !hasMega) {
          hasMega = true
        }
        if (pokemon.speciesName?.toLowerCase().includes('mega') && hasMega) {
          canPush = false
        }

        // push teamMember to the team or reiterate
        if (canPush) {
          t.push(pokemon)
          dexNrs.add(data.dex)
          pokemon.types.forEach((type) => types.add(type))
          IDs.add(pokemon.speciesId)
        } else {
          i--
        }
      })
    }

    updateTeam({
      name: Math.random().toString(36).substring(7),
      id: Math.random().toString(36).substring(7),
      format: meta,
      members: t,
    })
  }

  const handleOnClickAddTeam = () => {
    setTeamToEdit(null)
    setIsCrafting(true)
  }

  const handleEditTeam = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
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
    if (
      window.confirm(
        'You cannot undo this action. Are you sure you want to delete this team?'
      )
    ) {
      const i = parseInt(e.currentTarget.value, 10)

      if (team && team.id === user.teams[i].id) {
        setTeam(undefined)
      }

      user.teams.splice(i, 1)
      setTeams(user.teams)
    }
  }

  if (isLoading) {
    return <Loader type="TailSpin" color="#68BFF5" height={80} width={80} />
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
        user.teams.map((userTeam: UserTeam, i: number) => {
          if (userTeam.format === meta) {
            return (
              <div className={style.wrapper} key={userTeam.id}>
                <button
                  className={style.box}
                  value={i}
                  onClick={handleEditTeam}
                >
                  <label className={style.label}>{userTeam.name}</label>
                  <div className={style.members}>
                    {userTeam.members.length > 0 &&
                      userTeam.members.map(
                        (member: TeamMember, index: number) => (
                          <img
                            key={index}
                            src={imagesHandler.getMini(member.sid)}
                            alt={member.speciesName}
                          />
                        )
                      )}
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
      <div className={style.addButtons}>
        <button
          className="btn btn-primary"
          style={{ marginBottom: '10px' }}
          onClick={handleOnClickAddTeam}
        >
          Add Team
        </button>
        <button
          className="btn btn-primary"
          onClick={handleOnClickAddRandomTeam}
        >
          Get Random Team
        </button>
      </div>
    </div>
  )
}

const TeamPage = () => {
  // const { user } = useContext(UserContext)
  const [metas] = useState([
    'Great League',
    'MainSeries Cup',
    'Ultra League',
    'Master League',
  ])
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
