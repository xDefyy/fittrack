import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Users from './pages/Users'
import Programs from './pages/Programs'
import Muscles from './pages/Muscles'
import Sessions from './pages/Sessions'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem('user'))

  function handleLogin(userData: object) {
    const json = JSON.stringify(userData)
    localStorage.setItem('user', json)
    setUser(json)
  }

  function handleLogout() {
    localStorage.removeItem('user')
    setUser(null)
  }

  function PrivateRoute({ children }: { children: React.ReactNode }) {
    return user ? <>{children}</> : <Navigate to="/login" replace />
  }

  return (
    <div className="app">
      {user && <Navbar onLogout={handleLogout} />}
      <main className="main">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Navigate to="/sessions" replace /></PrivateRoute>} />
          <Route path="/sessions" element={<PrivateRoute><Sessions /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
          <Route path="/programs" element={<PrivateRoute><Programs /></PrivateRoute>} />
          <Route path="/muscles" element={<PrivateRoute><Muscles /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  )
}
