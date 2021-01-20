import Character, { CharacterProps } from './Character'
import style from './field.module.scss'

interface FieldProps {
  characters: [CharacterProps, CharacterProps]
}

const Field: React.FunctionComponent<FieldProps> = ({ characters }) => {
  return (
    <section className={style.root}>
      <div className={style.player}>
        <Character
          char={characters[0].char}
          status={characters[0].status}
          back={true}
        />
      </div>
      <Character char={characters[1].char} status={characters[1].status} />
    </section>
  )
}

export default Field
