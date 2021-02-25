import useWindowSize from '@common/actions/useWindowSize'
import Header from '@components/header/Header'
import style from './layout.module.scss'

const Layout: React.FunctionComponent = ({ children }) => {
  const { height } = useWindowSize()

  return (
    <main className={style.root} style={{ height }}>
      <Header />
      <div className={style.content}>{children}</div>
    </main>
  )
}

export default Layout
