import classnames from 'classnames'
import { useState } from 'react'

import { NICE, GREAT, EXCELLENT } from './constants'
import style from './stepper.module.scss'

interface StepperProps {
  onStep: (x: number) => void
}

const Stepper: React.FC<StepperProps> = ({ onStep }) => {
  const [stepperCharge, setStepperCharge] = useState(0)
  const [stepperLabel, setStepperLabel] = useState('')

  const onStepperClick = () => {
    if (stepperCharge < 100) {
      let stepperCount = stepperCharge
      stepperCount += 7;
      setStepperCharge(stepperCount)
      if (stepperCount >= 30 && stepperCount < 80) {
        setStepperLabel(NICE)
        onStep(0.5)
      } else if (stepperCount >= 70 && stepperCount < 100) {
        setStepperLabel(GREAT)
        onStep(0.75)
      } else if (stepperCount >= 100) {
        setStepperLabel(EXCELLENT)
        onStep(1)
      }
    }
  }
  return (
    <div>
      <button
        onClick={onStepperClick}
        className={classnames([style.button, style[stepperLabel.toLowerCase()]])}
      >
        {stepperLabel === '' ? 'Tap to Charge' : stepperLabel}
      </button>
    </div>
  )
}

export default Stepper
