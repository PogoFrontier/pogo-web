import { useContext, useState } from 'react'
import UserContext, { UserTeam } from '@context/UserContext'
import SocketContext from '@context/SocketContext'
import TeamContext from '@context/TeamContext'
import { CODE } from '@adibkhan/pogo-web-backend/actions'
import Modal from '@components/modal/Modal'
import TeamSelector from '@components/team_selector/TeamSelector'
import TeamPreview from '@components/team_preview/TeamPreview'
import style from './style.module.scss'

interface FriendRequestDisplayProps {
    challenge: {
        challenger: {
            googleId: string
            username: string
        }
        format: any
    },
    challengeHook: [any[], (challenges: any[]) => void],
    setError: (error: string) => void
}

const ChallengeDisplay: React.FunctionComponent<FriendRequestDisplayProps> = ({
    challenge,
    challengeHook,
    setError
}) => {
    const { user } = useContext(UserContext)
    const { socket } = useContext(SocketContext)
    const [challenges, setChallenges] = challengeHook
    const { team, setTeam } = useContext(TeamContext)
    const [ modalOpen, setModalOpen ] = useState(false)

    const decline = () => {
        socket.send(JSON.stringify({
            type: CODE.challenge_decline,
            payload: {
                challenger: challenge.challenger
            }
        }))
        setChallenges(challenges.filter(c => c.challenger?.googleId !== challenge.challenger.googleId))
    }

    const accept = () => {
        let defaultTeam: UserTeam | undefined = team;
        if(defaultTeam.format !== challenge.format) {
            defaultTeam = user.teams.find(userTeam => {
                userTeam.format === challenge.format
            })
        }

        if(!defaultTeam) {
            setError(`You don't have a team for the format ${challenge.format}`)
            return
        }

        setTeam(defaultTeam);
        setModalOpen(true);
    }

    const confirmAccept = () => {
        socket.send(JSON.stringify({
            type: CODE.challenge_accept,
            payload: {
                challenger: challenge.challenger
            }
        }))
    }

    const onSelect = (id: string) => {
        const newTeam = user.teams.find((x) => x.id === id)
        if (newTeam) {
            setTeam(newTeam)
        }
    }

    const closeModal = () => {
        setModalOpen(false)
    }

    return (<>
        <div>
            <strong>
                {challenge.challenger.username}
            </strong>
            <div>
                {challenge.format.toString()}
            </div>
        </div>
        <button
            className="btn btn-primary"
            onClick={accept}
        >
            accept
        </button>
        <button
            className="btn btn-negative"
            onClick={decline}
        >
            decline
        </button>

        {modalOpen && <Modal title={`Accept challenge from ${challenge.challenger.username}`} onClose={closeModal}>
            <button
                className="btn btn-negative"
                onClick={closeModal}
            >
                Cancel
            </button>

            <TeamPreview />
            <div className={style.game}>
                <TeamSelector onSelect={onSelect} formatFilter={challenge.format}/>
            </div>
            <button
                className="btn btn-primary"
                onClick={confirmAccept}
            >
                Confirm
            </button>
        </Modal>}
    </>)
}

export default ChallengeDisplay
