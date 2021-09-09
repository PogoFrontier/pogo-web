import { useContext } from 'react'
import LanguageContext from '@context/LanguageContext'
import UserContext from '@context/UserContext'
import { FriendInfo } from '@context/FriendContext'

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
    friends
}) => {
    const { user } = useContext(UserContext)
    const strings = useContext(LanguageContext).strings

    const sendFR = () => {
        send(opponent.username)
    }

    return (
    <div>
        {opponent.isGuest ? "Guest" : opponent.username}
        <button
            className="btn btn-secondary"
            onClick={sendFR}
            disabled={opponent.isGuest || user.requests?.map(r => r.username).includes(opponent.username) || friends.map(f => f.username).includes(opponent.username)}
        >
            {strings.send}
        </button>
    </div>)
}

export default RecentOpponentDisplay
