import { FriendRequest } from '@context/UserContext'
import { useContext } from 'react'
import FriendContext from '@context/FriendContext'
import { Icon } from '@components/icon/Icon'

interface FriendRequestDisplayProps {
  request: FriendRequest
  removeRequest: (req: FriendRequest) => void
}

const FriendRequestDisplay: React.FunctionComponent<FriendRequestDisplayProps> = ({
  request,
  removeRequest,
}) => {
  const { declineFriendRequest, acceptFriendRequest } = useContext(
    FriendContext
  )

  const decline = async () => {
    await declineFriendRequest(request.id)
    removeRequest(request)
  }
  const accept = async () => {
    await acceptFriendRequest(request.id)
    removeRequest(request)
  }

  return (
    <div className="row-spaced">
      <div className="large">{request.username}</div>
      <div>
        <button
          onClick={accept}
          style={{ marginRight: 10 }}
          className="btn btn-icon btn-positive"
        >
          <Icon name="check" size="medium" />
        </button>
        <button onClick={decline} className="btn btn-icon btn-negative">
          <Icon name="times" size="medium" />
        </button>
      </div>
    </div>
  )
}

export default FriendRequestDisplay
