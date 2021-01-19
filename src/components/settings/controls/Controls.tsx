import Input from "@components/input/Input"
import style from "./controls.module.scss"

const Controls = () => {
  return (
    <div className={style.root}>
      <section>
        <Input
          title="Fast Attack / Charge Move Powerup"
          highlighted={true}
        />
        <Input
          title="Switch 1"
          highlighted={true}
        />
        <Input
          title="Switch 2"
          highlighted={true}
        />
      </section>
      <section>
        <Input
          title="Shield"
          highlighted={true}
        />
        <Input
          title="Charge 1"
          highlighted={true}
        />
        <Input
          title="Charge 2"
          highlighted={true}
        />
      </section>
    </div>
  )
}

export default Controls