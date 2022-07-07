import { FriendRequest } from '@context/UserContext'
import { useContext } from 'react'
import FriendContext from '@context/FriendContext'
import { Icon } from '@components/icon/Icon'

interface OutgoingFriendRequestDisplayProps {
  request: FriendRequest
  removeRequest: (req: FriendRequest) => void
}

const OutgoingFriendRequestDisplay: React.FunctionComponent<OutgoingFriendRequestDisplayProps> = ({
  request,
  removeRequest,
}) => {
  const { cancelFriendRequest } = useContext(FriendContext)

  const cancel = async () => {
    await cancelFriendRequest(request.id)
    removeRequest(request)
  }

  return (
    <div className="row-spaced">
      <div className="large">{request.username}</div>
      <div>
        <button onClick={cancel} className="btn btn-icon btn-negative">
          <Icon name="times" size="medium" />
        </button>
      </div>
    </div>
  )
}

export default OutgoingFriendRequestDisplay
