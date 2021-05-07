import Layout from '@components/layout/Layout'
import Controls from '@components/settings/controls/Controls'
import Account from '@components/settings/account/Account'
import Split from '@components/split/Split'
import { TabPanel } from '@reach/tabs'
import style from './style.module.scss'
import { useContext } from 'react'
import SettingsContext from '@context/SettingsContext'
import { getStrings } from '@trans/translations'

const SettingsPage = () => {
  const settings = useContext(SettingsContext)
  const strings = getStrings(settings.language)

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
