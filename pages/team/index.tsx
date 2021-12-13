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
import { TeamMember } from '@adibkhan/pogo-web-backend'
import Loader from 'react-loader-spinner'
import TeamContext, { defaultTeam } from '@context/TeamContext'
import {
  getPokemonData,
  getValidateTeam,
  getRandomPokemon,
} from '@common/actions/pokemonAPIActions'
import getCP, { BaseStatsProps } from '@common/actions/getCP'
import ErrorPopup from '@components/error_popup/ErrorPopup'
import ImportTeam from '@components/import_team/ImportTeam'
import calculateStats from '@common/actions/calculateStats'
import LanguageContext from '@context/LanguageContext'
import metaMap from '@common/actions/metaMap'
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import getIVs from '@common/actions/getIVs'

interface ContentProps {
  meta: string
  switchMeta: (m: string) => void
}

interface ButtonProps {
  title: string
  onClick: () => void
  className: string
}

const Content: React.FC<ContentProps> = ({ meta }) => {
  const { user, setTeams } = useContext(UserContext)
  const [isCrafting, setIsCrafting] = useState(false)
  const [teamToEdit, setTeamToEdit] = useState<UserTeam | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRandomTeamLoading, setIsRandomTeamLoading] = useState(false)
  const [isImportingTeam, setIsImportingTeam] = useState(false)
  const imagesHandler = new ImageHandler()
  const { team, setTeam } = useContext(TeamContext)
  const [importString, setImportString] = useState('')
  const [popup, setPopup] = useState('')
  const [error, setError] = useState('')
  const [popupTitle, setPopupTitle] = useState('')
  const [popupButtons, setPopupButtons] = useState(
    undefined as ButtonProps[] | undefined
  )
  const [isImportLoading, setIsImportLoading] = useState(false)

  const {
    strings, 
    current: language
  } = useContext(LanguageContext)

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

  const getNewName = (action: string): string => {
    for (let iteration = 1; true; iteration++) {
      const suggestion = action + "_" + iteration
      if(!user.teams.map(_team => _team.name).includes(suggestion)) {
        return suggestion
      }
    }
  }

  /**
   * Adds a Random Team to the userTeams
   */
  async function handleOnClickAddRandomTeam() {
    setIsRandomTeamLoading(true)

    const data = await getRandomPokemon(
      meta.split(CODE.UnrankedSuffix)[0],
      language
    )
    if (data === undefined) {
      alert('An unexpected error occured')
      return
    } else if (data instanceof Error) {
      alert(data.message)
      return
    }

    const members = data

    setIsRandomTeamLoading(false)

    updateTeam({
      name: getNewName("Random"),
      id: Math.random().toString(36).substring(7),
      format: meta,
      members,
    })
  }

  async function handleImportTeam() {
    setIsImportLoading(true)
    try {
      const importedTeam = await unformatTeam(importString)

      const result = await getValidateTeam(
        JSON.stringify(importedTeam.members),
        meta,
        language
      )
      if (result.message) {
        setError(result.message)
        setPopupTitle(strings.invalid_team)
        setPopupButtons(undefined)
      } else {
        updateTeam(importedTeam)
        setIsImportingTeam(false)
      }
      setIsImportLoading(false)

    } catch (error) {
      setError(strings.invalid_team_object)
      setPopupTitle(strings.invalid_team)
      setPopupButtons(undefined)
      setIsImportLoading(false)
      return
    }
  }

  const handleOnClickAddTeam = () => {
    setTeamToEdit(null)
    setIsCrafting(true)
  }

  const startTeamImport = () => {
    setIsImportingTeam(true)
    setImportString('')
  }

  const cancelTeamImport = () => {
    setIsImportLoading(false)
    setIsImportingTeam(false)
  }

  const handleImportChange = (event: any) => {
    setImportString(event.target.value)
  }

  const formatTeam = (t: UserTeam): string => {
    return t.members.map((poke) => {
      return  [
        [poke.speciesId, poke.fastMove, ...poke.chargeMoves, poke.level, poke.iv.atk, poke.iv.def, poke.iv.hp].join(","),
        poke.name || "",
        poke.shiny ? "SHINY" : "NOTSHINY"
      ].join("|")
    }).join("\n");
  }

  const unformatTeam = async (s: string): Promise<UserTeam> => {
    const members: TeamMember[] = await Promise.all( s.split("\n").map(async line => {

      const [prefix, nickname, isShinyString] = line.split("|")
      const [_speciesId, fastMove, chargeMove1, chargeMove2, levelString, atkIvString, defIvString, hpIvString] = prefix.split(",")
      let speciesId = _speciesId
      if(speciesId?.endsWith("-shadow")) {
        speciesId = speciesId.split("-shadow")[0]
        if(!speciesId.endsWith("_shadow")) {
          speciesId = speciesId + "_shadow"
        }
      }

      let iv
      let level = 0
      const p = await getPokemonData(speciesId, 'norestrictions')
      const bs = p.baseStats as BaseStatsProps

      if (!levelString || !atkIvString || !defIvString || !hpIvString) {
        const cap = metaMap[meta].maxCP
        const ivs = getIVs({
          pokemon: p,
          targetCP: cap ? cap : 10000,
        })[0]
        iv = ivs.ivs
        level = ivs.level
        
      } else {
        iv = {
          atk: +atkIvString,
          def: +defIvString,
          hp: +hpIvString
        }
        level = +levelString
      }

      const cp = getCP(bs, [level, iv.atk, iv.def, iv.hp])
      const stats = calculateStats(bs, level, iv.atk, iv.def, iv.hp)
      const gender = getGender(p.gender);

      return {
        speciesId,
        speciesName: p.speciesName[language],
        name: nickname || undefined,
        shiny: isShinyString === "SHINY",
        fastMove,
        chargeMoves: [chargeMove1, chargeMove2] as [string, string],
        level,
        iv,
        baseStats: bs,
        ...stats,
        cp,
        types: p.types,
        sid: p.sid,
        gender
      }
    }))

    return {
      name: getNewName("Import"),
      id: Math.random().toString(36).substring(7),
      format: meta,
      members,
    }
  }

  const getGender = (gender: "M" | "F" | "N"): "M" | "F" | "N" => {
    if(gender) {
      return gender;
    }
    return ["M", "F"][Math.round(Math.random())] as "M" | "F";
  }

  const handleExport = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const teamToExport = user.teams[parseInt(e.currentTarget.value, 10)]
    navigator.clipboard.writeText(formatTeam(teamToExport))
    setPopup(strings.team_copied_succes)
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

  const onPopupClose = () => {
    setPopup('')
  }

  const onErrorPopupClose = () => {
    setError('')
  }

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (window.confirm(strings.confirm_team_delete)) {
      const i = parseInt(e.currentTarget.value, 10)

      if (team && team.id === user.teams[i].id) {
        setTeam(defaultTeam)
      }

      user.teams.splice(i, 1)
      setTeams(user.teams)
    }
  }

  if (isLoading) {
    return <Loader type="TailSpin" color="#68BFF5" height={80} width={80} />
  }

  if (!user || !user.teams) {
    return <p>{strings.teambuilder_signin}</p>
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
      {!!popup && (
        <ErrorPopup
          title={popup}
          error={' '}
          onClose={onPopupClose}
          buttons={undefined}
        />
      )}
      {!!error && (
        <ErrorPopup
          error={error}
          title={popupTitle}
          onClose={onErrorPopupClose}
          buttons={popupButtons}
        />
      )}
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
                            src={imagesHandler.getMini(member.sid, member.gender)}
                            alt={member.speciesName as string}
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
                    {strings.delete}
                  </button>
                  <button
                    value={i}
                    onClick={handleExport}
                    className={classnames([style.btn, style.edit])}
                  >
                    {strings.export}
                  </button>
                </div>
              </div>
            )
          }
        })
      ) : (
        <p>{strings.no_teams_display}</p>
      )}
      <div className={style.addButtons}>
        <button className="btn btn-primary" onClick={handleOnClickAddTeam}>
          {strings.add_team}
        </button>
        {isRandomTeamLoading ? (
          <Loader type="TailSpin" color="#68BFF5" height={30} width={30} />
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleOnClickAddRandomTeam}
          >
            {strings.add_random_team}
          </button>
        )}
        <button
          className="btn btn-primary"
          onClick={startTeamImport}
          style={{ visibility: isImportingTeam ? 'hidden' : 'visible' }}
        >
          {strings.import_team}
        </button>
      </div>

      <ImportTeam
        visible={isImportingTeam}
        importString={importString}
        saveImportString={handleImportChange}
        cancelImport={cancelTeamImport}
        confirmImport={handleImportTeam}
        isLoading={isImportLoading}
      />
    </div>
  )
}

const TeamPage = () => {
  // const { user } = useContext(UserContext)
  const [metas] = useState(Object.keys(metaMap).filter(meta => !metaMap[meta].random))
  const [metaNames] = useState(metas.map((meta) => metaMap[meta].name))
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

  const switchMeta = (m: string) => {
    const i = metas.findIndex((x) => x === m)
    if (i > -1) {
      setIndex(i)
    }
  }

  const onChange = (i: number) => {
    setIndex(i)
  }

  const tabs = metas.map((x) => (
    <TabPanel key={x}>
      <Content meta={x} switchMeta={switchMeta} />
    </TabPanel>
  ))

  return (
    <Layout>
      <Split
        tabs={metaNames}
        // buttonProps={{ title: "New Meta", onClick: addMeta }}
        tabProps={{ index, onChange, children: null }}
      >
        {tabs}
      </Split>
    </Layout>
  )
}

export default TeamPage
