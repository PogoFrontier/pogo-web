import Layout from '@components/layout/Layout'
import LanguageContext from '@context/LanguageContext'
import SocketContext from '@context/SocketContext'
import UserContext, { FriendRequest } from '@context/UserContext'
import style from './style.module.scss'
import classnames from 'classnames'
import React, { useContext, useState, ChangeEvent, useEffect } from 'react'
import Input from '@components/input/Input'
import FriendRequestPopup from '@components/send_fr_popup/FriendRequestPopup'
import UnauthenticatedPopup from '@components/unauthenticated_popup/UnauthenticatedPopup'
import FriendRequestDisplay from '@components/friend_request_display/FriendRequestDisplay'
import RecentOpponentDisplay from '@components/recent_opponent_display/RecentOpponentDisplay'
import FriendContext, { FriendInfo } from '@context/FriendContext'
import FriendDisplay from '@components/friend_display/FriendDisplay'
import FriendPopup from '@components/friend_popup/FriendPopup'
import UnfriendPopup from '@components/unfriend_popup/UnfriendPopup'
import OutgoingFriendRequestDisplay from '@components/outgoing_friend_request_display/OutgoingFriendRequestDisplay'

const FriendsPage = () => {
  const { user, setUser, loadUser } = useContext(UserContext)
  const { isSocketAuthenticated } = useContext(SocketContext)
  const { getFriends } = useContext(FriendContext)
  const strings = useContext(LanguageContext).strings
  const [friendToSendFR, setFriendToSendFR] = useState('')
  const [frPopupTarget, setFrPopupTarget] = useState('')
  const [, setRequests] = useState([
    ...(user?.requests || []),
    ...(user?.requestsSent || []),
  ])
  const [friends, setFriends] = useState([] as FriendInfo[])
  const [friendPopup, setFriendPopup] = useState<FriendInfo | null>(null)
  const [unfriendPopup, setUnfriendPopup] = useState<FriendInfo | null>(null)

  const loadFriends = () => {
    if (user) {
      getFriends().then((response) => {
        setFriends(response)
      })
    }
  }

  useEffect(loadFriends, [user])

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFriendToSendFR(event.target.value)
  }

  const onSendFriendRequest = () => {
    setFrPopupTarget(friendToSendFR)
  }

  const sendFriendRequestTo = (username: string) => {
    setFrPopupTarget(username)
  }

  const onFriendRequestPopupClose = (success: boolean) => {
    setFrPopupTarget('')
    if (success) {
      setFriendToSendFR('')
      loadUser()
    }
  }

  const placebo = () => {
    // Placebo
  }

  const removeRequest = (req: FriendRequest) => {
    user.requests = user.requests?.filter((r) => r.id !== req.id)
    setUser(user)
    setRequests([...(user.requests || []), ...(user.requestsSent || [])])
    loadUser()
  }

  const removeOutgoingRequest = (req: FriendRequest) => {
    user.requestsSent = user.requestsSent?.filter((r) => r.id !== req.id)
    setUser(user)
    setRequests([...(user.requests || []), ...(user.requestsSent || [])])
    loadUser()
  }

  const openFriendPopup = (friend: FriendInfo) => {
    setFriendPopup(friend)
  }

  const closeFriendPopup = () => {
    setFriendPopup(null)
  }

  const openUnfriendPopup = (friend: FriendInfo) => {
    setUnfriendPopup(friend)
  }

  const closeUnfriendPopup = (includeFriendPopup: boolean) => {
    setUnfriendPopup(null)
    setFriendPopup(includeFriendPopup ? null : friendPopup)
    if (includeFriendPopup) {
      loadUser()
    }
  }

  return (
    <Layout>
      <main className={style.root}>
        <div className={style.content}>
          <section className={classnames([style.container, style.info])}>
            <h1>{strings.friends}</h1>
            {friends.map((friend, index) => {
              return (
                <FriendDisplay
                  friend={friend}
                  key={index}
                  openPopup={openFriendPopup}
                />
              )
            })}
          </section>
          <div>
            <section className={classnames([style.container, style.info])}>
              <h1>{strings.send_friend_request}</h1>
              <div>{strings.new_friend_input_desc}</div>
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

            <section className={classnames([style.container, style.info])}>
              <h1>{strings.friend_requests}</h1>
              <h2>Incoming</h2>
              {user?.requests?.map((friendRequest) => {
                return (
                  <FriendRequestDisplay
                    request={friendRequest}
                    key={friendRequest.id}
                    removeRequest={removeRequest}
                  />
                )
              })}
              <h2>Outgoing</h2>
              {user?.requestsSent?.map((friendRequest) => {
                return (
                  <OutgoingFriendRequestDisplay
                    request={friendRequest}
                    key={friendRequest.id}
                    removeRequest={removeOutgoingRequest}
                  />
                )
              })}
            </section>

            <section className={classnames([style.container, style.info])}>
              <h1>{strings.recently_played}</h1>
              {user?.battleHistory?.reverse().map((opponent, i) => {
                return (
                  <RecentOpponentDisplay
                    opponent={opponent}
                    send={sendFriendRequestTo}
                    friends={friends}
                    key={i}
                  />
                )
              })}
            </section>
          </div>
        </div>
      </main>
      {frPopupTarget && (
        <FriendRequestPopup
          onClose={onFriendRequestPopupClose}
          username={frPopupTarget}
        />
      )}
      {!isSocketAuthenticated && (
        <UnauthenticatedPopup offerGuestUser={false} onClose={placebo} />
      )}
      {friendPopup && (
        <FriendPopup
          friend={friendPopup}
          onClose={closeFriendPopup}
          openUnfriendPopup={openUnfriendPopup}
        />
      )}
      {unfriendPopup && (
        <UnfriendPopup friend={unfriendPopup} onClose={closeUnfriendPopup} />
      )}
    </Layout>
  )
}

export default FriendsPage
