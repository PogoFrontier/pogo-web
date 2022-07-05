import htmlConst from "./htmlConst"
import style from './style.module.scss'

const Privacy = () => {
    return (
        <div className={style.root} dangerouslySetInnerHTML={{ __html: htmlConst }}/>
    )
}

export default Privacy
