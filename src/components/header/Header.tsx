import React from 'react'
import style from './header.module.scss'
import Link from 'next/link'
import {
  Menu,
  MenuButton,
  MenuList,
  MenuLink,
} from '@reach/menu-button'
import '@reach/menu-button/styles.css'
import { Icon } from '@components/icon/Icon'
// import UserContext from '@context/UserContext'

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
      </ul>
      <div className={style.hamburger}>
        <Menu>
          <MenuButton className={style.menubutton}>
            <Icon name="menu" size="medium" />
          </MenuButton>
          <MenuList>
            <Link href="/">
              <MenuLink>Home</MenuLink>
            </Link>
            <Link href="/team">
              <MenuLink>Team</MenuLink>
            </Link>
            <Link href="/settings">
              <MenuLink>Settings</MenuLink>
            </Link>
            {/* <MenuItem onSelect={handleAuth} className={style.logout}>
              Log out
            </MenuItem> */}
          </MenuList>
        </Menu>
      </div>
    </header>
  )
}

export default Header
