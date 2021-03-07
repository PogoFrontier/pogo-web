import Form from '@components/form/Form'
import Layout from '@components/layout/Layout'
import TeamContext from '@context/TeamContext'
import { useContext } from 'react'
import style from './style.module.scss'
import getMini from '@common/actions/getMini'
import UserContext from '@context/UserContext'
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from '@reach/combobox'
import '@reach/combobox/styles.css'
import { TeamMember } from '@adibkhan/pogo-web-backend'

interface TeamOptionProps {
  team: TeamMember[]
  name: string
  id: string
}

const TeamOption: React.FC<TeamOptionProps> = ({ team, name, id }) => {
  return (
    <ComboboxOption value={id} className={style.option}>
      <strong>{name}</strong>
      <br />
      {team.map((member: any, index: number) => (
        <img key={index} src={getMini(member.sid)} alt={member.speciesName} />
      ))}
    </ComboboxOption>
  )
}

const HomePage = () => {
  const user = useContext(UserContext).user
  const { team, setTeam } = useContext(TeamContext)

  const onSelect = (id: any) => {
    const newTeam = user.teams.find((x) => x.id === id)
    if (newTeam) {
      setTeam(newTeam.members)
    }
  }

  return (
    <Layout>
      <main className={style.root}>
        <div className={style.content}>
          <Form />
          <section className={style.members}>
            <h2>Current Team</h2>
            {team &&
              team.map((member: any, index: number) => (
                <img
                  key={index}
                  className={style.member}
                  src={getMini(member.sid)}
                  alt={member.speciesName}
                />
              ))}
            <Combobox
              className={style.inputwrap}
              aria-label="Select Pokemon"
              onSelect={onSelect}
              openOnFocus={true}
            >
              <ComboboxInput placeholder="See Teams" value="" />
              <ComboboxPopover>
                <ComboboxList>
                  {user && user.teams && user.teams.length > 0 ? (
                    user.teams.map((x) => (
                      <TeamOption
                        team={x.members}
                        name={x.name}
                        id={x.id}
                        key={x.id}
                      />
                    ))
                  ) : (
                    <p>No teams available</p>
                  )}
                </ComboboxList>
              </ComboboxPopover>
            </Combobox>
          </section>
        </div>
      </main>
    </Layout>
  )
}

export default HomePage
