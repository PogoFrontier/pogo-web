import { FriendInfo } from '@context/FriendContext'

interface FriendDisplayProps {
    friend: FriendInfo
    openPopup: (friend: FriendInfo) => void
}

const FriendDisplay: React.FunctionComponent<FriendDisplayProps> = ({
    friend,
    openPopup
}) => {

    const open = () => {
        openPopup(friend)
    }

    return (<div onClick={open}>
        {friend.username} {friend.status || (Math.floor(new Date().getTime() / 1000) - (friend.lastActivity ? friend.lastActivity._seconds : 0)) + "s ago"}
    </div>)
}

export default FriendDisplay
