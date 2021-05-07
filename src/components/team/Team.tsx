import ImageHandler from '@common/actions/getImages'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import style from './team.module.scss'
import { useContext } from 'react'
import SettingsContext from '@context/SettingsContext'
import { getStrings } from '@trans/translations'

interface TeamProps {
  team: TeamMember[]
  isPlayer?: boolean
}

const Team: React.FC<TeamProps> = ({ team, isPlayer }) => {
  const imageHandler = new ImageHandler()

  const settings = useContext(SettingsContext)
  const strings = getStrings(settings.language)
  return (
    <section className={style.root}>
      {team &&
        team.map((x) => (
          <span className={style.member} key={x.speciesId}>
            <label>
              {strings.cp} {x.cp}
            </label>
            <img
              className={style.sprite}
              src={imageHandler.getImage(x.sid, x.shiny, isPlayer)}
              alt={x.speciesName}
            />
          </span>
        ))}
    </section>
  )
}

export default Team
