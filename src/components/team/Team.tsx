import getImage from "@common/actions/getImage";
import { TeamMember } from "@adibkhan/pogo-web-backend";

interface TeamProps {
  team: TeamMember[],
  isPlayer?: boolean
}

const Team: React.FC<TeamProps> = ({team, isPlayer}) => {
  return (
    <section>
      {
        team.map(x => (
          <span key={x.speciesId}>
            <label>CP {x.cp}</label>
            <img
              src={getImage(x.sid, x.shiny, isPlayer)}
              alt={x.speciesName}
            />
          </span>
        ))
      }
    </section>
  )
}

export default Team