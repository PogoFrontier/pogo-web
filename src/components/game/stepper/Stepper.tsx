import getKeyDescription from '@common/actions/getKeyDescription'
import classnames from 'classnames'
import { useContext, useEffect, useState } from 'react'

import style from './stepper.module.scss'
import SettingsContext from '@context/SettingsContext'
import useKeyPress from '@common/actions/useKeyPress'
import { getStrings } from '@trans/translations'

interface StepperProps {
  onStep: (x: number) => void
  step: number
}

const Stepper: React.FC<StepperProps> = ({ onStep, step }) => {
  const [stepperCharge, setStepperCharge] = useState(25)
  const [stepperLabel, setStepperLabel] = useState('')
  const { showKeys, keys } = useContext(SettingsContext)
  const { fastKey } = keys

  const settings = useContext(SettingsContext)
  const strings = getStrings(settings.language)

  const fastKeyClick = useKeyPress(fastKey)

  const onStepperClick = () => {
    if (stepperCharge < 100) {
      let stepperCount = stepperCharge
      stepperCount += 5
      setStepperCharge(stepperCount)
      if (stepperCount >= 50 && stepperCount < 75) {
        setStepperLabel(strings.nice)
        onStep(stepperCount / 100)
      } else if (stepperCount >= 75 && stepperCount < 95) {
        setStepperLabel(strings.great)
        onStep(stepperCount / 100)
      } else if (stepperCount >= 95) {
        setStepperLabel(strings.excellent)
        onStep(stepperCount / 100)
      }
    }
  }

  useEffect(() => {
    if (step >= 0.95) {
      setStepperLabel(strings.excellent)
    } else if (step >= 0.75) {
      setStepperLabel(strings.great)
    } else if (step >= 0.5) {
      setStepperLabel(strings.nice)
    }
  }, [step])

  useEffect(onStepperClick, [fastKeyClick])

  return (
    <div className={style.column}>
      {showKeys && (
        <label className={style.keylabel}>
          {strings.press.replace(
            '%1',
            getKeyDescription(fastKey).toUpperCase()
          )}
        </label>
      )}
      <button
        onClick={onStepperClick}
        className={classnames([
          style.button,
          style[stepperLabel.toLowerCase()],
        ])}
      >
        {stepperLabel === '' ? strings.charge_tap : stepperLabel}
      </button>
    </div>
  )
}

export default Stepper
