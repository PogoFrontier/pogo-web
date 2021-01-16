import Form from '@components/form/Form'
import Layout from '@components/layout/Layout'
import style from './style.module.scss'

const HomePage = () => {
  return (
    <Layout>
      <main className={style.root}>
        <div className={style.content}>
          <Form />
        </div>
      </main>
    </Layout>
  )
}

export default HomePage
