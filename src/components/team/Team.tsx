import getImage from '@common/actions/getImage'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import style from './team.module.scss'

interface TeamProps {
  team: TeamMember[]
  isPlayer?: boolean
}

const Team: React.FC<TeamProps> = ({ team, isPlayer }) => {
  return (
    <section className={style.root}>
      {team && team.map((x) => (
        <span className={style.member} key={x.speciesId}>
          <label>CP {x.cp}</label>
          <img
            className={style.sprite}
            src={getImage(x.sid, x.shiny, isPlayer)}
            alt={x.speciesName}
          />
        </span>
      ))}
    </section>
  )
}

export default Team
