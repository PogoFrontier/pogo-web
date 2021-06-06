import Form from '@components/form/Form'
import Layout from '@components/layout/Layout'
import TeamContext from '@context/TeamContext'
import CookieConsent from 'react-cookie-consent'
import React, { useContext } from 'react'
import style from './style.module.scss'
import UserContext from '@context/UserContext'
import '@reach/combobox/styles.css'
import ImageHandler from '@common/actions/getImages'
import classnames from 'classnames'
import { Icon } from '@components/icon/Icon'
import '@reach/listbox/styles.css'
import LanguageContext from '@context/LanguageContext'
import { StringsType } from '@common/actions/getLanguage'
import TeamSelector from '@components/team_selector/TeamSelector'

function truncateString(str: string, num: number) {
  if (str.length > num) {
    return str.slice(0, num) + '...'
  } else {
    return str
  }
}

const myColor = '#FCAC89'
const myProfile = 2
const HomePage = () => {
  const user = useContext(UserContext).user
  const { team, setTeam } = useContext(TeamContext)
  const imagesHandler = new ImageHandler()
  const strings: StringsType = useContext(LanguageContext).strings

  const onSelect = (id: string) => {
    const newTeam = user.teams.find((x) => x.id === id)
    if (newTeam) {
      setTeam(newTeam)
    }
  }

  return (
    <Layout>
      <main className={style.root}>
        <div className={style.content}>
          <section className={classnames([style.container, style.full])}>
            <div
              className={style.game}
              style={{
                background: `linear-gradient(300deg, #FFFFFF 80%, ${myColor} 85%)`,
              }}
            >
              <img
                src={imagesHandler.getProfile(myProfile)}
                className={style.profileImage}
              />
              <div className={style.teamPreview}>
                <div>
                  <p className={style.teamTitle}>
                    <strong>
                      {team.name
                        ? truncateString(team.name, 8)
                        : strings.your_team}{' '}
                      /{' '}
                    </strong>
                    {team.format}
                  </p>
                  <div className={style.members}>
                    {team &&
                      team.members &&
                      team.members.map((member: any, index: number) => (
                        <img
                          key={index}
                          className={style.member}
                          src={imagesHandler.getMini(member.sid)}
                          alt={member.speciesName}
                        />
                      ))}
                  </div>
                </div>
              </div>
              <TeamSelector onSelect={onSelect} />
            </div>
            <Form />
          </section>
          <section className={classnames([style.container, style.info])}>
            <h1>{strings.friends}</h1>
            {strings.coming_soon}
          </section>
          <section className={classnames([style.container, style.info])}>
            <h1>{strings.links}</h1>
            <div className={style.links}>
              <a
                className="btn btn-secondary"
                href="https://github.com/DeveloperKhan/pogo-web"
                target="_blank"
                rel="noreferrer nofollow"
              >
                <Icon name="github" size="medium" /> Github (Frontend)
              </a>
              <a
                className="btn btn-secondary"
                href="https://github.com/DeveloperKhan/pogo-web-backend"
                target="_blank"
                rel="noreferrer nofollow"
              >
                <Icon name="github" size="medium" /> Github (Backend)
              </a>
              <a
                className="btn btn-secondary"
                href="https://app.lokalise.com/public/991869486095447a82fab4.67696706/"
                target="_blank"
                rel="noreferrer nofollow"
              >
                <Icon name="lokalise" size="medium" /> Lokalise (
                {strings.translations})
              </a>
            </div>
          </section>
        </div>
      </main>
      <CookieConsent
        location="bottom"
        buttonText="I accept"
        cookieName="cookieconsent"
        style={{ backgroundColor: '#707070' }}
        buttonStyle={{ backgroundColor: '#68BFF5', fontSize: '15px' }}
        expires={150}
      >
        {strings.cookies_description}
      </CookieConsent>
    </Layout>
  )
}

export default HomePage
