import Layout from '@components/layout/Layout'
import Controls from '@components/settings/controls/Controls'
import Account from '@components/settings/account/Account'
import Split from '@components/split/Split'
import { TabPanel } from '@reach/tabs'
import style from './style.module.scss'
import { useContext } from 'react'
import LanguageContext from '@context/LanguageContext'

const SettingsPage = () => {
  const strings = useContext(LanguageContext).strings

  return (
    <Layout>
      <main className={style.root}>
        <Split tabs={[strings.controls, strings.account]}>
          <TabPanel>
            <Controls />
          </TabPanel>
          <TabPanel>
            <Account />
          </TabPanel>
        </Split>
      </main>
    </Layout>
  )
}

export default SettingsPage
