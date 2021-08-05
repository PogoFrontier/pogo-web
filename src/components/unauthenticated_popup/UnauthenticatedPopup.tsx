import ErrorPopup from '@components/error_popup/ErrorPopup'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import SocketContext from '@context/SocketContext'
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import LanguageContext from '@context/LanguageContext'

interface UnauthenticatedPopupProps {
  offerGuestUser: boolean
  onClose: () => void
}

const UnauthenticatedPopup: React.FunctionComponent<UnauthenticatedPopupProps> = ({
  offerGuestUser,
  onClose,
}) => {
  const strings = useContext(LanguageContext).strings
  const { socket } = useContext(SocketContext)

  const router = useRouter()

  const buttons = [
    {
      title: strings.offer_account,
      onClick: () => {
        router.push('/login')
      },
      className: 'btn btn-secondary',
    },
  ]
  if (offerGuestUser) {
    buttons.push({
      title: strings.offer_guest,
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
      error={strings.error_please_authenticate}
      title={strings.not_authenticated_title}
      buttons={buttons}
    />
  )
}

export default UnauthenticatedPopup
