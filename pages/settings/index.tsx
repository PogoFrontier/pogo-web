import Layout from '@components/layout/Layout'
import Split from '@components/split/Split'
import { TabPanel } from '@reach/tabs'
import style from './style.module.scss'

const SettingsPage = () => {
  return (
    <Layout>
      <main className={style.root}>
        <Split tabs={["Controls", "Account"]}>
          <TabPanel>
            <h1>
              Controls
            </h1>
          </TabPanel>
        </Split>
      </main>
    </Layout>
  )
}

export default SettingsPage
