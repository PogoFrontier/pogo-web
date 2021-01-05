import React from 'react'
import style from './header.module.scss'
import Link from 'next/link'

const Header: React.FunctionComponent = () => {
  return (
    <header className={style.header}>
      <div className={style.title}>Project Grookey</div>
      <ul className={style.links}>
        <li>
          <Link href="/">
            <a>Home</a>
          </Link>
        </li>
        <li>
          <Link href="/team">
            <a>Team</a>
          </Link>
        </li>
        <li>
          <Link href="/settings">
            <a>Settings</a>
          </Link>
        </li>
        <button className="btn btn-negative">
          Log out
        </button>
      </ul>
    </header>
  )
}

export default Header
