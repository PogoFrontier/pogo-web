import Modal from '@components/modal/Modal'
import { FriendInfo } from '@context/FriendContext'


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

  const unfriend = () => {
    openUnfriendPopup(friend)
  }

  return (
    <Modal title={""} onClose={onClose}>

      <button
        className="btn btn-primary"
        onClick={onClose}
      >
        Challenge
      </button>
      <button
        className="btn btn-negative"
        onClick={unfriend}
      >
        Unfriend
      </button>
      
    </Modal>
  )
}

export default FriendPopup
