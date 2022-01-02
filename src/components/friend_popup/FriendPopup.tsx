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
import ErrorPopup from '@components/error_popup/ErrorPopup'
import { useRouter } from 'next/router'
import LanguageContext from '@context/LanguageContext'

interface FriendRequestPopupProps {
  friend: FriendInfo
  onClose: () => void
  openUnfriendPopup?: (friend: FriendInfo) => void
}

const FriendPopup: React.FunctionComponent<FriendRequestPopupProps> = ({
  friend,
  openUnfriendPopup,
  onClose
}) => {
  const user = useContext(UserContext).user
  const { team, setTeam } = useContext(TeamContext)
  const strings = useContext(LanguageContext).strings
  const [status, setStatus] = useState<"default" | "challenge" | "waiting" | "error" | "declined">("default")
  const [err, setErr] = useState("")
  const [room, setRoom] = useState("")
  const { socket } = useContext(SocketContext)
  const router = useRouter()

  socket.onmessage = (msg: MessageEvent) => {
    if (msg.data.startsWith('$error')) {
      const data = msg.data.slice(6)
      setStatus("error")
      setErr(data)
    } else if (msg.data.startsWith('$PROMT_JOIN')) {
      const roomId = msg.data.slice('$PROMT_JOIN'.length)
      joinRoom(roomId)
      setRoom(roomId)
    } else if (msg.data.startsWith('$start')) {
      router.push(`/matchup/${room}`)
    } else if (msg.data.startsWith('$challengeDeclined')) {
      setStatus("declined")
      setErr(`${friend.username} declined your challenge`)
    }
  }

  function joinRoom(roomId?: string) {
    if (!team.format) {
      return
    }

    // Connected, let's sign-up for to receive messages for this room
    const data = {
      type: CODE.room,
      payload: {
        room: roomId,
        format: team.format,
        team: team.members,
      },
    }
    socket.send(JSON.stringify(data))
  }

  const onSelect = (id: string) => {
    let newTeam = user.teams.find((x) => x.id === id)
    if (id.startsWith("randomMeta:")) {
      newTeam = {
        name: "random",
        id: id,
        format: id.substr("randomMeta:".length),
        members: []
      }
    }
    
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
    if(openUnfriendPopup)
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

  if (err) {
    return (<ErrorPopup error={err} onClose={close} title={status === "declined" ? strings.challenge_declined_title : ""}/>)
  }

  return (
    <Modal title={friend.username} onClose={close}>
      {status === "default" && <>
        <button
          className="btn btn-primary"
          onClick={openChallenge}
        >
          {strings.challenge}
        </button>
        {!!openUnfriendPopup && <>
          <hr />
          <button
            className="btn btn-negative"
            onClick={unfriend}
          >
            {strings.unfriend}
          </button>
        </>}
      </>}

      {status === "challenge" && <>
        <TeamPreview />
        <div className={style.game}>
          <TeamSelector onSelect={onSelect} />
        </div>
        <br />
        <button
          className="btn btn-primary"
          onClick={sendChallenge}
        >
          {strings.challenge}
        </button>
        <button
          className="btn btn-negative"
          onClick={cancelChallengeMode}
        >
          {strings.cancel}
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
          {strings.quit}
        </button>
      </>}

    </Modal>
  )
}

export default FriendPopup
