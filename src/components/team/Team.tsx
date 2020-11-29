import { SERVER } from "@config/index";
import { TeamMember } from "types/team";

interface TeamProps {
  team: TeamMember[],
  isPlayer?: boolean
}

const getTeam = (sid: number, shiny: boolean | undefined, back: boolean | undefined) : string => {
  let s = `${SERVER}/models/${sid.toString()}`
  if (back) {
    s = s + "-b"
  }
  if (shiny) {
    s = s + "-s"
  }
  return s + ".gif"
}

const Team: React.FC<TeamProps> = ({team, isPlayer}) => {
  return (
    <section>
      {
        team.map(x => (
          <span key={x.speciesId}>
            <label>CP {x.cp}</label>
            <img
              src={getTeam(x.sid, x.shiny, isPlayer)}
              alt={x.speciesName}
            />
          </span>
        ))
      }
    </section>
  )
}

export default Team