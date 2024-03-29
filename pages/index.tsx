import Form from '@components/form/Form'
import Layout from '@components/layout/Layout'
import TeamContext from '@context/TeamContext'
import CookieConsent from 'react-cookie-consent'
import React, { useContext, useState, useEffect } from 'react'
import style from './style.module.scss'
import UserContext from '@context/UserContext'
import '@reach/combobox/styles.css'
import ImageHandler from '@common/actions/getImages'
import classnames from 'classnames'
import { Icon } from '@components/icon/Icon'
import Link from 'next/link'
import LanguageContext from '@context/LanguageContext'
import SocketContext from '@context/SocketContext'
import IdContext from '@context/IdContext'
import TeamSelector from '@components/team_selector/TeamSelector'
import UsernamePopup from '@components/username_popup/UsernamePopup'
import '@reach/listbox/styles.css'
import TeamPreview from '@components/team_preview/TeamPreview'
import { useRouter } from 'next/router'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import { getValidateTeam } from '@common/actions/pokemonAPIActions'
import ChallengeDisplay from '@components/challenge_display/ChallengeDisplay'
import metaMap from '@common/actions/metaMap'
import TriangleTooltip from '@components/tooltip/TriangleTooltip'
import FriendDisplay from '@components/friend_display/FriendDisplay'
import FriendContext, { FriendInfo } from '@context/FriendContext'
import FriendPopup from '@components/friend_popup/FriendPopup'

const myColor = '#FCAC89'
const myProfile = 2
const HomePage = () => {
  const user = useContext(UserContext).user
  const { setTeam } = useContext(TeamContext)
  const imagesHandler = new ImageHandler()
  const { strings, current: language } = useContext(LanguageContext)
  const {
    socket,
    isSocketAuthenticated,
    setIsSocketAuthenticated,
  } = useContext(SocketContext)
  const { setId } = useContext(IdContext)
  const router = useRouter()
  const [error, setError] = useState('')
  const [room, setRoom] = useState('')
  const [state, setState] = useState<'quick' | 'loading'>('quick')
  const [challenges, setChallenges] = useState([] as any[])
  const [friends, setFriends] = useState([] as FriendInfo[])
  const team = useContext(TeamContext).team
  const { getFriends } = useContext(FriendContext)
  const [friendPopup, setFriendPopup] = useState<FriendInfo | null>(null)
  let teamMembers: TeamMember[]
  if (team) {
    teamMembers = team.members
  }

  const loadFriends = () => {
    if (user) {
      getFriends().then((response) => {
        setFriends(response)
      })
    }
  }
  useEffect(loadFriends, [user])

  useEffect(() => {
    if (isSocketAuthenticated) {
      setChallenges([])
      socket.send(
        JSON.stringify({
          type: CODE.challenge_reload,
        })
      )
    }
  }, [isSocketAuthenticated, user?.username])

  const onSelect = (id: string) => {
    let newTeam = user.teams.find((x) => x.id === id)
    if (id.startsWith('randomMeta:')) {
      newTeam = {
        name: 'random',
        id,
        format: id.substr('randomMeta:'.length),
        members: [],
      }
    }
    if (newTeam) {
      setTeam(newTeam)
    }
  }

  socket.onmessage = (msg: MessageEvent) => {
    if (msg.data.startsWith('$Authentication')) {
      const success = msg.data.startsWith('$Authentication Success')
      setIsSocketAuthenticated(success)
      if (success && msg.data.length > '$Authentication Success'.length) {
        setId(msg.data.split(': ')[1])
      }
    } else if (msg.data.startsWith('$error')) {
      const data = msg.data.slice(6)
      setState('quick')
      setError(data)
    } else if (msg.data.startsWith('$start')) {
      router.push(`/matchup/${room}`)
    } else if (msg.data.startsWith('$PROMT_JOIN')) {
      const roomId = msg.data.slice('$PROMT_JOIN'.length)
      joinRoom(roomId)
    } else if (msg.data.startsWith('$challengedBy')) {
      const challengeData = msg.data.slice('$challengedBy|'.length)
      setChallenges([...challenges, JSON.parse(challengeData)])
    } else if (msg.data.startsWith('$challengeCancelled')) {
      const challengeData = JSON.parse(
        msg.data.slice('$challengeCancelled|'.length)
      )
      setChallenges(
        challenges.filter(
          (challenge) => challenge?.challenger?.googleId !== challengeData?.id
        )
      )
    }
  }

  function joinRoom(roomId?: string) {
    if (!team.format) {
      return
    }
    if (roomId) {
      setRoom(roomId)
    } else {
      roomId = room
    }

    // Connected, let's sign-up for to receive messages for this room
    const data = {
      type: CODE.room,
      payload: {
        room: roomId,
        format: team.format,
        team: teamMembers,
      },
    }
    socket.send(JSON.stringify(data))
  }

  async function validate(): Promise<boolean> {
    if (metaMap[team?.format]?.random) {
      return true
    }

    const result = await getValidateTeam(
      JSON.stringify(teamMembers),
      team.format,
      language
    )
    if (result.message) {
      setError(result.message)
      return false
    }
    return true
  }

  const openFriendPopup = (friend: FriendInfo) => {
    setFriendPopup(friend)
  }

  const closeFriendPopup = () => {
    setFriendPopup(null)
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
              <TeamPreview />
              <TeamSelector
                onSelect={onSelect}
                disabled={state === 'loading'}
              />
            </div>
            <Form
              joinRoom={joinRoom}
              hooks={[error, setError, room, setRoom, state, setState]}
              validate={validate}
            />
          </section>
          {!!user && (!!user.googleId || !!user.username) ? (
            <>
              <section className={classnames([style.container, style.info])}>
                <h1 className={style.flexRow}>
                  {strings.challenges_header.replace(
                    '%1',
                    challenges.length.toString()
                  )}
                  <TriangleTooltip label={strings.challenges_tooltip}>
                    <div>
                      <Icon name={'question'} />
                    </div>
                  </TriangleTooltip>
                </h1>
                {challenges.map((challenge, index) => {
                  return (
                    <ChallengeDisplay
                      key={index}
                      challenge={challenge}
                      challengeHook={[challenges, setChallenges]}
                      setError={setError}
                    />
                  )
                })}
              </section>
              <section className={classnames([style.container, style.info])}>
                <h1>{strings.friends}</h1>
                {friends.slice(0, 10).map((friend, index) => {
                  return (
                    <FriendDisplay
                      friend={friend}
                      key={index}
                      openPopup={openFriendPopup}
                    />
                  )
                })}
                <Link href="/friends">{strings.go_to_friends_console}</Link>
              </section>
            </>
          ) : (
            <section className={classnames([style.container, style.info])}>
              <Link href="/login">{strings.login_homepage}</Link>
            </section>
          )}
          <section className={classnames([style.container, style.info])}>
            <h1>{strings.links}</h1>
            <div className={style.links}>
              <a
                className="btn btn-secondary block"
                href="https://github.com/DeveloperKhan/pogo-web"
                target="_blank"
                rel="noreferrer nofollow"
                style={{
                  backgroundColor: '#171515',
                  color: 'white',
                  fill: 'white',
                }}
              >
                <Icon name="github" size="medium" /> Github
              </a>
              <a
                className="btn btn-secondary block"
                href="https://twitter.com/ProjectGrookey"
                target="_blank"
                rel="noreferrer nofollow"
                style={{
                  backgroundColor: '#1DA1F2',
                  color: 'white',
                  fill: 'white',
                }}
              >
                <Icon name="twitter" size="medium" /> Twitter
              </a>
              <a
                className="btn btn-secondary block"
                href="https://www.patreon.com/pogofrontier?fan_landing=true"
                target="_blank"
                rel="noreferrer nofollow"
                style={{
                  backgroundColor: '#FF424D',
                  color: 'white',
                  fill: 'white',
                }}
              >
                <Icon name="patreon" size="medium" /> Patreon
              </a>
              <a
                className="btn btn-secondary block"
                href="https://medium.com/@PoGOFrontier"
                target="_blank"
                rel="noreferrer nofollow"
                style={{
                  backgroundColor: '#FEC016',
                  color: 'black',
                  fill: 'black',
                }}
              >
                <Icon name="medium" size="medium" /> Medium
              </a>
              <a
                className="btn btn-secondary block"
                href="https://app.lokalise.com/public/991869486095447a82fab4.67696706/"
                target="_blank"
                rel="noreferrer nofollow"
                style={{ backgroundColor: '#C9E8F2', color: 'black' }}
              >
                <Icon name="lokalise" size="medium" /> Lokalise
              </a>
              <Link href="/privacy">Privacy Policy</Link>
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
      {user && user.email && !user.username && <UsernamePopup />}
      {friendPopup && (
        <FriendPopup friend={friendPopup} onClose={closeFriendPopup} />
      )}
    </Layout>
  )
}

export default HomePage
