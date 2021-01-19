import { Tabs, TabList, Tab, TabPanels } from "@reach/tabs"
import "@reach/tabs/styles.css"
import style from './split.module.scss'

interface SplitProps {
  tabs: string[]
}

const Split: React.FC<SplitProps> = ({ tabs, children }) => {
  return (
    <Tabs className={style.root}>
      <TabList className={style.tablist}>
        {
          tabs.map(x => (
            <Tab
              key={x}
              className={style.tab}
            >
              {x}
            </Tab>
          ))
        }
      </TabList>
      <TabPanels className={style.panels}>
        { children }
      </TabPanels>
    </Tabs>
  )
}

export default Split
