import classnames from "classnames"
import { useEffect, useState } from "react"
import style from './popover.module.scss'

interface PopoverProps {
  closed: boolean,
  showMenu?: boolean
}

const Popover: React.FC<PopoverProps> = ({ children, closed, showMenu }) => {
  const [c, setC] = useState(true)

  useEffect(() => {
    if (c !== closed) {
      setTimeout(() => setC(closed), 200)
    }
  }, [closed])

  if (closed) {
    return null
  }
  return (
    <div className={style.root}>
      <div className={classnames([style.menu, {
        [style.closed]: c || !showMenu,
      }])}>
        {children}
      </div>
    </div>
  )
}

export default Popover
