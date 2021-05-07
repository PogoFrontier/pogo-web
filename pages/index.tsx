import Form from '@components/form/Form'
import Layout from '@components/layout/Layout'
import TeamContext from '@context/TeamContext'
import CookieConsent from 'react-cookie-consent'
import { useContext } from 'react'
import style from './style.module.scss'
import UserContext from '@context/UserContext'
import '@reach/combobox/styles.css'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import ImageHandler from '@common/actions/getImages'
import classnames from 'classnames'
import { Icon } from '@components/icon/Icon'
import {
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
  ListboxOption,
  ListboxPopoverProps,
} from '@reach/listbox'
import '@reach/listbox/styles.css'
import SettingsContext from '@context/SettingsContext'
import { getStrings } from '@trans/translations'

function truncateString(str: string, num: number) {
  if (str.length > num) {
    return str.slice(0, num) + '...'
  } else {
    return str
  }
}

const right: ListboxPopoverProps['position'] = (targetRect, popoverRect) => {
  const triggerCenter = targetRect!.left + targetRect!.width
  const left = triggerCenter - popoverRect!.width
  const maxLeft = window.innerWidth - popoverRect!.width - 2
  return {
    left: Math.min(Math.max(2, left), maxLeft) + window.scrollX,
    top: targetRect!.bottom + 8 + window.scrollY,
  }
}

interface TeamOptionProps {
  team: TeamMember[]
  name: string
  id: string
}

const TeamOption: React.FC<TeamOptionProps> = ({ team, name, id }) => {
  const imagesHandler = new ImageHandler()

  return (
    <ListboxOption value={id} className={style.option}>
      <strong>{name}</strong>
      <br />
      {team.map((member: any, index: number) => (
        <img
          key={index}
          src={imagesHandler.getMini(member.sid)}
          className={style.member}
          alt={member.speciesName}
        />
      ))}
    </ListboxOption>
  )
}

const myColor = '#FCAC89'
const myProfile = 2
const HomePage = () => {
  const user = useContext(UserContext).user
  const { team, setTeam } = useContext(TeamContext)
  const imagesHandler = new ImageHandler()
  const settings = useContext(SettingsContext)
  const strings = getStrings(settings.language)

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
              <ListboxInput
                aria-label={strings.select_team}
                onChange={onSelect}
                className={style.listbox}
                defaultValue="defaultTeam"
              >
                <div className={style.changeWrap}>
                  <ListboxButton className={style.changeTeam}>
                    <Icon name="down" />
                  </ListboxButton>
                  <small>{strings.change_team}</small>
                </div>
                <ListboxPopover className={style.popover} position={right}>
                  <ListboxList>
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
                      <p className={style.noteams}>
                        {strings.team_not_available}
                      </p>
                    )}
                  </ListboxList>
                </ListboxPopover>
              </ListboxInput>
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
