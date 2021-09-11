import Modal from '@components/modal/Modal'
import { FriendInfo } from '@context/FriendContext'
import UserContext from '@context/UserContext'
import SocketContext from '@context/SocketContext'
import TeamContext from '@context/TeamContext'
import { useState, useContext } from 'react'
import TeamSelector from '@components/team_selector/TeamSelector'
import TeamPreview from '@components/team_preview/TeamPreview'
import style from './style.module.scss'
import { CODE } from '@adibkhan/pogo-web-backend/actions'


interface FriendRequestPopupProps {
  friend: FriendInfo
  onClose: () => void
  openUnfriendPopup: (friend: FriendInfo) => void
}

const FriendPopup: React.FunctionComponent<FriendRequestPopupProps> = ({
  friend,
  openUnfriendPopup,
  onClose
}) => {
  const user = useContext(UserContext).user
  const { team, setTeam } = useContext(TeamContext)
  const [status, setStatus] = useState<"default" | "challenge" | "waiting">("default")
  const { socket } = useContext(SocketContext)

  const onSelect = (id: string) => {
    const newTeam = user.teams.find((x) => x.id === id)
    if (newTeam) {
      setTeam(newTeam)
    }
  }

  const close = () => {
    if(status === "waiting") {
      quitChallenge()
    }
    onClose()
  }

  const unfriend = () => {
    openUnfriendPopup(friend)
  }

  const openChallenge = () => {
    setStatus("challenge")
  }

  const cancelChallengeMode = () => {
    setStatus("default")
  }

  const sendChallenge = () => {
    const data = {
      type: CODE.challenge_open,
      payload: {
        opponentId: friend.id,
        format: team.format
      }
    }
    socket.send(JSON.stringify(data))
    setStatus("waiting")
  }

  const quitChallenge = () => {
    const data = {
      type: CODE.challenge_quit,
      payload: {
        opponentId: friend.id
      }
    }
    socket.send(JSON.stringify(data))
    setStatus("challenge")
  }

  return (
    <Modal title={""} onClose={close}>
      {status === "default" && <>
        <button
          className="btn btn-primary"
          onClick={openChallenge}
        >
          Challenge
        </button>

        <button
          className="btn btn-negative"
          onClick={unfriend}
        >
          Unfriend
        </button>
      </>}

      {status === "challenge" && <>
        <button
          className="btn btn-negative"
          onClick={cancelChallengeMode}
        >
          Cancel
        </button>

        <TeamPreview />
        <div className={style.game}>
          <TeamSelector onSelect={onSelect} />
        </div>
        <button
          className="btn btn-primary"
          onClick={sendChallenge}
        >
          Challenge
        </button>
      </>}

      {status === "waiting" && <>
        <TeamPreview />
        <div className={style.game}>
          <TeamSelector onSelect={onSelect} />
        </div>
        <button
          className="btn btn-negative"
          onClick={quitChallenge}
        >
          Quit
        </button>
      </>}

    </Modal>
  )
}

export default FriendPopup
