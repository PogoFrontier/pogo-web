import { Tabs, TabList, Tab, TabPanels, TabsProps } from "@reach/tabs"
import "@reach/tabs/styles.css"
import classnames from "classnames"
import style from './split.module.scss'

interface SplitProps {
  tabs: string[]
  tabProps?: TabsProps
  buttonProps?: {
    title: string,
    onClick: () => void
  }
}

const Split: React.FC<SplitProps> = ({ tabs, children, tabProps, buttonProps }) => {
  return (
    <Tabs className={style.root} {...tabProps} >
      <TabList className={style.tablist}>
        {
          buttonProps && (
            <button
              className={classnames(["btn btn-primary", [style.btn]])}
              onClick={buttonProps.onClick}
            >
              { buttonProps.title }
            </button>
          )
        }
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
