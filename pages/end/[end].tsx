import Header from '@components/header/Header'
import style from './style.module.scss'

const EndPage = () => {
  return (
    <main className={style.root}>
      <Header/>
      <div className={style.content}>
        <h1>Game over</h1>
        <button className={"btn btn-negative"}>Play again</button>
      </div>
    </main>
  )
}

export default EndPage