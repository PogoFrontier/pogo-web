import Input from '@components/input/Input'
import Modal from '@components/modal/Modal'
import SettingsContext from '@context/SettingsContext'
import { getStrings } from '@trans/translations'
import Loader from 'react-loader-spinner'
import style from './style.module.scss'
import { useContext } from 'react'

interface RoomModalProps {
  onClose: () => void
  room: string
  join: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isLoading?: boolean
}

const RoomModal: React.FunctionComponent<RoomModalProps> = ({
  onClose,
  room,
  join,
  isLoading,
  onChange,
}) => {
  const settings = useContext(SettingsContext)
  const strings = getStrings(settings.language)
  return (
    <Modal
      onClose={onClose}
      title={strings.browse_rooms}
      className={style.modal}
    >
      {isLoading ? (
        <Loader type="TailSpin" color="#68BFF5" height={60} width={60} />
      ) : (
        <>
          <div className={style.inputWrap}>
            <div className={style.input}>
              <Input
                title={strings.create_room}
                value={room}
                onChange={onChange}
              />
            </div>
            <button
              className={style.button}
              onClick={join}
              disabled={room.length <= 0}
            >
              Create
            </button>
          </div>
          <p>Room Search Coming Soon!</p>
        </>
      )}
    </Modal>
  )
}

export default RoomModal
