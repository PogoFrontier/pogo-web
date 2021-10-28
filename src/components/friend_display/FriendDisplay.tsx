import { FriendInfo } from '@context/FriendContext'
import style from './style.module.scss'
import classNames from 'classnames'
import day from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

interface FriendDisplayProps {
    friend: FriendInfo
    openPopup: (friend: FriendInfo) => void
}

const dayjs = day
dayjs.extend(relativeTime)

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
                {friend.status || friend.lastActivity ? dayjs.unix(friend.lastActivity!._seconds).fromNow() : "0s ago"}
            </div>
        </div>
    </div>)
}

export default FriendDisplay
