import { useState } from 'react'

import { NICE, GREAT, EXCELLENT } from './constants'
import style from './stepper.module.scss'

const Stepper: React.FunctionComponent = () => {
  const [stepperCharge, setStepperCharge] = useState(0)
  const [stepperLabel, setStepperLabel] = useState('')

  const onStepperClick = () => {
    if (stepperCharge < 100) {
      let stepperCount = stepperCharge
      stepperCount += 10
      setStepperCharge(stepperCount)
      if (stepperCount >= 40 && stepperCount < 80) {
        setStepperLabel(NICE)
      } else if (stepperCount >= 80 && stepperCount < 100) {
        setStepperLabel(GREAT)
      } else if (stepperCount === 100) {
        setStepperLabel(EXCELLENT)
      }
    }
  }
  return (
    <div>
      <button
        onClick={onStepperClick}
        className={style[`button${stepperLabel}`]}
      >
        {stepperLabel === '' ? 'Tap to Charge' : stepperLabel}
      </button>
    </div>
  )
}

export default Stepper
