import { useContext, useState } from 'react'
import UserContext, { UserTeam } from '@context/UserContext'
import SocketContext from '@context/SocketContext'
import TeamContext from '@context/TeamContext'
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import Modal from '@components/modal/Modal'
import TeamSelector from '@components/team_selector/TeamSelector'
import TeamPreview from '@components/team_preview/TeamPreview'
import style from './style.module.scss'
import LanguageContext from '@context/LanguageContext'
import metaMap from '@common/actions/metaMap'

interface FriendRequestDisplayProps {
  challenge: {
    challenger: {
      googleId: string
      username: string
    }
    format: any
  }
  challengeHook: [any[], (challenges: any[]) => void]
  setError: (error: string) => void
}

const ChallengeDisplay: React.FunctionComponent<FriendRequestDisplayProps> = ({
  challenge,
  challengeHook,
  setError,
}) => {
  const { user } = useContext(UserContext)
  const { socket } = useContext(SocketContext)
  const [challenges, setChallenges] = challengeHook
  const { team, setTeam } = useContext(TeamContext)
  const strings = useContext(LanguageContext).strings
  const [modalOpen, setModalOpen] = useState(false)

  const decline = () => {
    socket.send(
      JSON.stringify({
        type: CODE.challenge_decline,
        payload: {
          challenger: challenge.challenger,
        },
      })
    )
    setChallenges(
      challenges.filter(
        (c) => c.challenger?.googleId !== challenge.challenger.googleId
      )
    )
  }

  const accept = () => {
    let defaultTeam: UserTeam | undefined = team

    if (metaMap[challenge.format].random) {
      defaultTeam = {
        name: 'random',
        id: "Autorekt",
        format: challenge.format,
        members: [],
      }
    } else if (defaultTeam.format !== challenge.format) {
      defaultTeam = user.teams.find((userTeam) => {
        return userTeam.format === challenge.format
      })
    }

    if (!defaultTeam) {
      setError(
        strings.no_team_with_format_error?.replace('%1', challenge.format)
      )
      return
    }

    setTeam(defaultTeam)
    setModalOpen(true)
  }

  const confirmAccept = () => {
    socket.send(
      JSON.stringify({
        type: CODE.challenge_accept,
        payload: {
          challenger: challenge.challenger,
        },
      })
    )
  }

  const onSelect = (id: string) => {
    const newTeam = user.teams.find((x) => x.id === id)
    if (newTeam) {
      setTeam(newTeam)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  return (
    <>
      <div>
        <strong>{challenge.challenger.username}</strong>
        <div>{challenge.format}</div>
      </div>
      <button className="btn btn-primary" onClick={accept}>
        {strings.accept}
      </button>
      <button className="btn btn-negative" onClick={decline}>
        {strings.decline}
      </button>

      {modalOpen && (
        <Modal
          title={`Accept challenge from ${challenge.challenger.username}`}
          onClose={closeModal}
        >
          <button className="btn btn-negative" onClick={closeModal}>
            {strings.cancel}
          </button>

          <TeamPreview />
          <div className={style.game}>
            <TeamSelector onSelect={onSelect} formatFilter={challenge.format} disabled={!!metaMap[challenge.format].random}/>
          </div>
          <button className="btn btn-primary" onClick={confirmAccept}>
            {strings.confirm}
          </button>
        </Modal>
      )}
    </>
  )
}

export default ChallengeDisplay
