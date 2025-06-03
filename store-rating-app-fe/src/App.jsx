import { Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './ProtectedRoute'

function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Login/>} />
      <Route path="/signUp" element={<SignUp/>} />
      <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>      
    </>
  )
}

export default App
