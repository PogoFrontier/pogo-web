import Header from '@components/header/Header'
import style from './style.module.scss'

const EndPage = () => {

  //TODO
  let win_string = "won"; 

  function join(){
    console.log("hello world");
  }


  return (
    <main className={style.root}>
      <Header />
      <div className={style.content}>
        <h1>Game over</h1>
        <span className={style.string}>You {win_string} the game</span>
        <div className={style.buttons}>
          <button onClick={join} className={'btn btn-negative'}>Play again</button>
          <a className={'btn btn-negative'} >Home</a>
        </div>
      </div>
    </main>
  )
}

export default EndPage
