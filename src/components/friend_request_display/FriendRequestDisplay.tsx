import { FriendRequest } from '@context/UserContext'
import { useContext } from 'react'
import FriendContext from '@context/FriendContext'
import LanguageContext from '@context/LanguageContext'

interface FriendRequestDisplayProps {
    request: FriendRequest
    removeRequest: (req: FriendRequest) => void
}

const FriendRequestDisplay: React.FunctionComponent<FriendRequestDisplayProps> = ({
    request,
    removeRequest
}) => {
    const { declineFriendRequest, acceptFriendRequest } = useContext(FriendContext)
    const strings = useContext(LanguageContext).strings

    const decline = () => {
        declineFriendRequest(request.id)
        removeRequest(request)
    }
    const accept = () => {
        acceptFriendRequest(request.id)
        removeRequest(request)
    }

    return (<div>
        {request.username}
        <button 
            onClick={accept}
            className="btn btn-primary">
            {strings.accept}
        </button>
        <button 
            onClick={decline}
            className="btn btn-negative">
            {strings.decline}
        </button>
    </div>)
}

export default FriendRequestDisplay
