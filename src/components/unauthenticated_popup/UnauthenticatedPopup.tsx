import ErrorPopup from '@components/error_popup/ErrorPopup'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import SocketContext from '@context/SocketContext'

interface UnauthenticatedPopupProps {
  offerGuestUser: boolean
  onClose: () => void
}

const UnauthenticatedPopup: React.FunctionComponent<UnauthenticatedPopupProps> = ({
  offerGuestUser,
  onClose,
}) => {
  const { socket } = useContext(SocketContext)

  const router = useRouter()

  const buttons = [
    {
      title: 'Login or Create an Account',
      onClick: () => {
        router.push('/login')
      },
      className: 'btn btn-secondary',
    },
  ]
  if (offerGuestUser) {
    buttons.push({
      title: 'Play as guest',
      onClick: () => {
        socket.send(
          JSON.stringify({
            type: 'AUTHENTICATION', // TODO: Change to constant
            asGuestUser: true,
          })
        )
        onClose()
      },
      className: 'btn btn-secondary',
    })
  }

  return (
    <ErrorPopup
      onClose={onClose}
      error={
        'If you want to play, you need to login with an account. You can also play as a guest, but guest players can only play unranked.'
      }
      title={'You are not authenticated'}
      buttons={buttons}
    />
  )
}

export default UnauthenticatedPopup
