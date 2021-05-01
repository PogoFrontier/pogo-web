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
          anim={characters[0].anim}
          back={true}
        />
      </div>
      <Character char={characters[1].char} anim={characters[1].anim} />
    </section>
  )
}

export default Field
