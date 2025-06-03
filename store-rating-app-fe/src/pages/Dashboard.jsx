import React, { useEffect, useState } from 'react'
import DashboardAdmin from '../component/DashboardAdmin'
import DashboardOwner from '../component/DashboardOwner'
import DashboardUser from '../component/DashboardUser'

function Dashboard() {
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    setUserData(user)
  }, [])

  let content = null
  if(userData?.role === "SYSTEM_ADMIN") {
    content = <DashboardAdmin />
  }else if (userData?.role === "STORE_OWNER") {
    content = <DashboardOwner />
  }else{
    content = <DashboardUser />
  }

  return <div>{content}</div>
}

export default Dashboard
