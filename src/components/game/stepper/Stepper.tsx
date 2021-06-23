import getKeyDescription from '@common/actions/getKeyDescription'
import classnames from 'classnames'
import { useContext, useEffect, useState } from 'react'

import style from './stepper.module.scss'
import SettingsContext from '@context/SettingsContext'
import useKeyPress from '@common/actions/useKeyPress'
import LanguageContext from '@context/LanguageContext'

interface StepperProps {
  onStep: (x: number) => void
  step: number
}

const Stepper: React.FC<StepperProps> = ({ onStep, step }) => {
  const [stepperCharge, setStepperCharge] = useState(25)
  const [stepperLabel, setStepperLabel] = useState('')
  const [lastStep, setLastStep] = useState(new Date())
  // This variable is a dummy to force updates
  const [renderNum, setRenderNum] = useState(0)
  const { showKeys, keys } = useContext(SettingsContext)
  const { fastKey } = keys

  const strings = useContext(LanguageContext).strings

  const fastKeyClick = useKeyPress(fastKey)

  const onStepperClick = () => {
    // Make sure we don't accidently charge up with one tap by adding a cooldown
    const diff = new Date().getTime() - lastStep.getTime()
    if (diff < 100) {
      setTimeout(() => setRenderNum(renderNum + 1), diff)
      return
    }
    setLastStep(new Date())

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

  if (fastKeyClick) {
    onStepperClick()
  }

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
