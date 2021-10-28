import { FriendInfo } from '@context/FriendContext'
import style from './style.module.scss'
import classNames from 'classnames'

interface FriendDisplayProps {
    friend: FriendInfo
    openPopup: (friend: FriendInfo) => void
}

const FriendDisplay: React.FunctionComponent<FriendDisplayProps> = ({
    friend,
    openPopup
}) => {

    const open = () => {
        openPopup(friend)
    }

    return (<div className={style.root} onClick={open}>
        <div className={classNames([style.status, {[style.online]: friend.status !== null}])}/>
        <div className={style.text}>
            <div className="large">
                {friend.username}
            </div>
            <div>
                {friend.status || (Math.floor(new Date().getTime() / 1000) - (friend.lastActivity ? friend.lastActivity._seconds : 0)) + "s ago"}
            </div>
        </div>
    </div>)
}

export default FriendDisplay
