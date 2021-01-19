import Header from '@components/header/Header'
import style from './layout.module.scss'

const Layout: React.FunctionComponent = ({ children }) => {
  return (
    <main className={style.root}>
      <Header />
      <div className={style.content}>{children}</div>
    </main>
  )
}

export default Layout
