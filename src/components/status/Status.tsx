import { TeamMember } from "types/team"

interface StatusProps {
  subject: TeamMember,
  shields: 0 | 1 | 2,
  remaining: 0 | 1 | 2 | 3,
}

const Status: React.FC<StatusProps> = ({ subject, shields, remaining }) => {
  const shieldComponents = new Array<JSX.Element>(shields).fill(<p>S</p>);
  const ballComponents = new Array<JSX.Element>(remaining).fill(<p>B</p>);
  return (
    <div>
      <div>
        {
          subject.types.map(x => (
            <span key={x}>{x}</span>
          ))
        }
      </div>
      <div>
        <div>
          { shieldComponents }
        </div>
        <small>{ subject.cp }</small>
        <strong>{ subject.speciesName }</strong>
      </div>
      { ballComponents }
    </div>
  )
}

export default Status