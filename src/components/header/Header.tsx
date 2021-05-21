import React, { useContext } from 'react'
import style from './header.module.scss'
import Link from 'next/link'
import { Menu, MenuButton, MenuList, MenuLink } from '@reach/menu-button'
import '@reach/menu-button/styles.css'
import { Icon } from '@components/icon/Icon'
import LanguageContext from '@context/LanguageContext'
// import UserContext from '@context/UserContext'

const Header: React.FunctionComponent = () => {
  const strings = useContext(LanguageContext).strings

  return (
    <header className={style.header}>
      <Link href="/">
        <div className={style.title} />
      </Link>
      <ul className={style.links}>
        <li>
          <Link href="/">
            <a>{strings.homepage}</a>
          </Link>
        </li>
        <li>
          <Link href="/team">
            <a>{strings.team}</a>
          </Link>
        </li>
        <li>
          <Link href="/settings">
            <a>{strings.settings}</a>
          </Link>
        </li>
      </ul>
      <div className={style.hamburger}>
        <Menu>
          <MenuButton className={style.menubutton}>
            <Icon name="menu" size="medium" />
          </MenuButton>
          <MenuList className={style.headerButtons}>
            <Link href="/">
              <MenuLink>{strings.homepage}</MenuLink>
            </Link>
            <Link href="/team">
              <MenuLink>{strings.team}</MenuLink>
            </Link>
            <Link href="/settings">
              <MenuLink>{strings.settings}</MenuLink>
            </Link>
            {/* <MenuItem onSelect={handleAuth} className={style.logout}>
              {strings.log_out}
            </MenuItem> */}
          </MenuList>
        </Menu>
      </div>
    </header>
  )
}

export default Header
