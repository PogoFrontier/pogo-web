import { TeamMember } from "@adibkhan/pogo-web-backend"
import style from './status.module.scss';

interface StatusProps {
  subject: TeamMember,
  shields: 0 | 1 | 2,
  remaining: 0 | 1 | 2 | 3,
}

const Status: React.FC<StatusProps> = ({ subject, shields, remaining }) => {
  const shieldComponents = new Array<JSX.Element>(shields).fill(<span>S</span>);
  const ballComponents = new Array<JSX.Element>(remaining).fill(<span>B</span>);
  return (
    <div className={style.root}>
      <div className={style.types}>
        {
          subject.types.map(x => (
            <span key={x}>{x}</span>
          ))
        }
      </div>
      <div className={style.container}>
        <div className={style.shields}>
          { shieldComponents }
        </div>
        <div>
          <small>CP { subject.cp }</small>
          <strong>{ subject.speciesName }</strong>
        </div>
      </div>
      { ballComponents }
    </div>
  )
}

export default Status