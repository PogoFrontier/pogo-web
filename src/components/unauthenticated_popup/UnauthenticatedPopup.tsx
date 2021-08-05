import ErrorPopup from '@components/error_popup/ErrorPopup'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import SocketContext from '@context/SocketContext'
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import { standardStrings } from '@common/actions/getLanguage'

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
      title: standardStrings.offer_account,
      onClick: () => {
        router.push('/login')
      },
      className: 'btn btn-secondary',
    },
  ]
  if (offerGuestUser) {
    buttons.push({
      title: standardStrings.offer_guest,
      onClick: () => {
        socket.send(
          JSON.stringify({
            type: CODE.authentication,
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
      error={standardStrings.error_please_authenticate}
      title={standardStrings.not_authenticated_title}
      buttons={buttons}
    />
  )
}

export default UnauthenticatedPopup
