import Form from '@components/form/Form'
import Layout from '@components/layout/Layout'
import TeamContext from '@context/TeamContext'
import { useContext } from 'react'
import style from './style.module.scss'
import getMini from '@common/actions/getMini'

const HomePage = () => {
  const team = useContext(TeamContext).team

  return (
    <Layout>
      <main className={style.root}>
        <div className={style.content}>
          <Form />
          {team.length > 0 ? (
            <div className={style.members}>
              {team.map((member: any, index: number) => (
                <img
                  key={index}
                  src={getMini(member.sid)}
                  alt={member.speciesName}
                />
              ))}
            </div>
          ) : (
            <p>You don't have a team</p>
          )}
        </div>
      </main>
    </Layout>
  )
}

export default HomePage
