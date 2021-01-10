import Layout from '@components/layout/Layout'
import UserContext from '@context/UserContext'
import React, { useContext } from 'react'

const teamPage = () => {
  const user = useContext(UserContext)

  return (
    <Layout>
      <h1>Teambuilder</h1>
      {user && user.teams && (
        <div>
          <h3>{user.displayName}'s Teams</h3>
          {user.teams.length > 0 ? (
            user.teams.map((team: any) => <p key={team.id}>{team.name}</p>)
          ) : (
            <p>No Teams to display</p>
          )}
        </div>
      )}
    </Layout>
  )
}

export default teamPage
