import { useContext } from 'react'
import UserContext from '@context/UserContext'
import { FriendInfo } from '@context/FriendContext'
import { Icon } from '@components/icon/Icon'

interface FriendRequestDisplayProps {
  opponent: {
    googleId: string
    isGuest: boolean
    username: string
  }
  send: (username: string) => void
  friends: FriendInfo[]
}

const RecentOpponentDisplay: React.FunctionComponent<FriendRequestDisplayProps> = ({
  opponent,
  send,
  friends,
}) => {
  const { user } = useContext(UserContext)

  const sendFR = () => {
    send(opponent.username)
  }

  return (
    <div className="row-spaced">
      {opponent.isGuest ? 'Guest' : opponent.username}
      <button
        className="btn btn-icon"
        onClick={sendFR}
        disabled={
          opponent.isGuest ||
          user.requests?.map((r) => r.username).includes(opponent.username) ||
          friends.map((f) => f.username).includes(opponent.username)
        }
      >
        <Icon name="plus" size="medium" />
      </button>
    </div>
  )
}

export default RecentOpponentDisplay
