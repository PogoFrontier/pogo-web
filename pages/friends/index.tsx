import Layout from '@components/layout/Layout'
import LanguageContext from '@context/LanguageContext'
import style from './style.module.scss'
import classnames from 'classnames'
import React, { useContext, useState, ChangeEvent} from 'react'
import Input from '@components/input/Input'
import FriendRequestPopup from '@components/send_fr_popup/FriendRequestPopup'


const TeamPage = () => {
  const strings = useContext(LanguageContext).strings
  const [friendToSendFR, setFriendToSendFR] = useState("")
  const [frPopupTarget, setFrPopupTarget] = useState("")

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFriendToSendFR(event.target.value)
  }

  const onSendFriendRequest = () => {
    setFrPopupTarget(friendToSendFR)
  }

  const onFriendRequestPopupClose = (success: boolean) => {
    setFrPopupTarget("")
    if(success) {
      setFriendToSendFR("")
    }
  }

  return (
    <Layout>
      <main className={style.root}>
        <div className={style.content}>
          <section className={classnames([style.container, style.info])}>
            <strong>
              {strings.send_friend_request}
            </strong>
            <Input
              title=""
              type="text"
              placeholder="None"
              id="FRTarget"
              onChange={onInputChange}
              value={friendToSendFR}
            />
            <button
              className="btn btn-secondary"
              onClick={onSendFriendRequest}
            >
              {strings.send}
            </button>
          </section>
        </div>
      </main>
      {frPopupTarget && <FriendRequestPopup onClose={onFriendRequestPopupClose} username={frPopupTarget} />}
    </Layout>
  )
}

export default TeamPage
