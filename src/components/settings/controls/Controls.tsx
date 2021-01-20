import Input from "@components/input/Input"
import SettingsContext from "@context/SettingsContext"
import { useContext, useEffect, useState } from "react"
import style from "./controls.module.scss"

const returnKey = (key: string) => {
  if (key === " ") {
    return "space"
  }
  return key
}

interface KeyInputProps {
  value: string
  title: string
  type: string
  onSetKey: (keyType: string, newKey: string) => void
}

const KeyInput: React.FC<KeyInputProps> = ({ value, title, type, onSetKey }) => {
  const [v, setV] = useState(value)

  useEffect(() => {
    setV(value)
  }, [value])

  const show = () => {
    setV("")
  }

  const hide = () => {
    if (v === "") {
      setV(value)
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    if (val.length === 0) {
      return
    }
    if (val.length !== 1) {
      val = val[val.length - 1]
    }
    setV(val)
    onSetKey(type, val)
  }

  return (
    <>
      <Input
        title={title}
        value={returnKey(v)}
        onFocus={show}
        onBlur={hide}
        onChange={onChange}
        highlighted={true}
      />
    </>
  )
}

const Controls = () => {
  const settings = useContext(SettingsContext)
  const {
    fastKey,
    charge1Key,
    charge2Key,
    switch1Key,
    switch2Key,
    shieldKey
  } = settings.keys

  const onSetKey = (keyType: string, newKey: string) => {
    const keysCopy = { ...settings.keys }
    const oldKey = keysCopy[keyType]
    for (const i of Object.keys(keysCopy)) {
      if (keysCopy[i] === newKey) {
        keysCopy[i] = oldKey
      }
    }
    keysCopy[keyType] = newKey
    settings.setKeys(keysCopy)
  }

  return (
    <div className={style.root}>
      <section>
        <KeyInput
          title="Fast Attack / Charge Move Powerup"
          value={fastKey}
          type="fastKey"
          onSetKey={onSetKey}
        />
        <KeyInput
          title="Switch 1"
          value={switch1Key}
          type="switch1Key"
          onSetKey={onSetKey}
        />
        <KeyInput
          title="Switch 2"
          value={switch2Key}
          type="switch2Key"
          onSetKey={onSetKey}
        />
      </section>
      <section>
        <KeyInput
          title="Shield"
          value={shieldKey}
          type="shieldKey"
          onSetKey={onSetKey}
        />
        <KeyInput
          title="Charge 1"
          value={charge1Key}
          type="charge1Key"
          onSetKey={onSetKey}
        />
        <KeyInput
          title="Charge 2"
          value={charge2Key}
          type="charge2Key"
          onSetKey={onSetKey}
        />
      </section>
    </div>
  )
}

export default Controls