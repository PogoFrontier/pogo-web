import getKeyDescription from '@common/actions/getKeyDescription'
import classnames from 'classnames'
import { useContext, useEffect, useState } from 'react'

import { NICE, GREAT, EXCELLENT } from './constants'
import style from './stepper.module.scss'
import SettingsContext from '@context/SettingsContext'
import useKeyPress from '@common/actions/useKeyPress'

interface StepperProps {
  onStep: (x: number) => void
  step: number
}

const Stepper: React.FC<StepperProps> = ({ onStep, step }) => {
  const [stepperCharge, setStepperCharge] = useState(25)
  const [stepperLabel, setStepperLabel] = useState('')
  const { showKeys, keys } = useContext(SettingsContext)
  const { fastKey } = keys

  const fastKeyClick = useKeyPress(fastKey)

  const onStepperClick = () => {
    if (stepperCharge < 100) {
      let stepperCount = stepperCharge
      stepperCount += 5
      setStepperCharge(stepperCount)
      if (stepperCount >= 50 && stepperCount < 75) {
        setStepperLabel(NICE)
        onStep(stepperCount / 100)
      } else if (stepperCount >= 75 && stepperCount < 95) {
        setStepperLabel(GREAT)
        onStep(stepperCount / 100)
      } else if (stepperCount >= 95) {
        setStepperLabel(EXCELLENT)
        onStep(stepperCount / 100)
      }
    }
  }

  useEffect(() => {
    if (step >= 0.95) {
      setStepperLabel(EXCELLENT)
    } else if (step >= 0.75) {
      setStepperLabel(GREAT)
    } else if (step >= 0.5) {
      setStepperLabel(NICE)
    }
  }, [step])

  useEffect(onStepperClick, [fastKeyClick])

  return (
    <div className={style.column}>
      {showKeys && (
        <label className={style.keylabel}>
          Press {getKeyDescription(fastKey).toUpperCase()}
        </label>
      )}
      <button
        onClick={onStepperClick}
        className={classnames([
          style.button,
          style[stepperLabel.toLowerCase()],
        ])}
      >
        {stepperLabel === '' ? 'Tap to Charge' : stepperLabel}
      </button>
    </div>
  )
}

export default Stepper
