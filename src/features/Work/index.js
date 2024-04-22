import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'

export const WorkContext = React.createContext()

function Work(props) {
  const [isSidebar, setIsSidebar] = useState(false)

  const onOpenSidebar = () => {
    setIsSidebar(true)
  }

  const onHideSidebar = () => {
    setIsSidebar(false)
  }
  return (
    <WorkContext.Provider
      value={{
        isSidebar: isSidebar,
        onHideSidebar: onHideSidebar,
        onOpenSidebar: onOpenSidebar
      }}
    >
      <Outlet />
    </WorkContext.Provider>
  )
}

export default Work
