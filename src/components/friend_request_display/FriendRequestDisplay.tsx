import { FriendRequest } from '@context/UserContext'
import { useContext } from 'react'
import FriendContext from '@context/FriendContext'

interface FriendRequestDisplayProps {
    request: FriendRequest
    removeRequest: (req: FriendRequest) => void
}

const FriendRequestDisplay: React.FunctionComponent<FriendRequestDisplayProps> = ({
    request,
    removeRequest
}) => {
    const { declineFriendRequest, acceptFriendRequest } = useContext(FriendContext)

    const decline = () => {
        declineFriendRequest(request.id)
        removeRequest(request)
    }
    const accept = () => {
        acceptFriendRequest(request.id)
        removeRequest(request)
    }

    return (
    <div>
        {request.username}
        <button onClick={decline}>decline</button>
        <button onClick={accept}>accept</button>
    </div>)
}

export default FriendRequestDisplay
