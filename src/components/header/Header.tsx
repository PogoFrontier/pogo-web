import React from 'react'
import style from './header.module.scss'

const Header: React.FunctionComponent = () => {
  return (
    <header className={style.header}>
      <div className={style.navbar}>
        <div className={style.title}>Project Grookey</div>
      </div>
    </header>
  )
}

export default Header
