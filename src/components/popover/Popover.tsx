import classnames from "classnames"
import { useEffect, useState } from "react"
import style from './popover.module.scss'

interface PopoverProps {
  closed: boolean
}

const Popover: React.FC<PopoverProps> = ({ children, closed }) => {
  const [c, setC] = useState(true)

  useEffect(() => {
    if (c !== closed) {
      if (closed === true) {
        setTimeout(() => setC(closed), 200)
      } else {
        setC(closed)
      }
    }
  }, [closed])

  if (c) {
    return null
  }
  return (
    <div className={classnames([style.root, {
      [style.closed]: closed
    }])}>
      {children}
    </div>
  )
}

export default Popover
