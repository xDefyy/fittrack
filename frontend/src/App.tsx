import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Users from './pages/Users'
import Programs from './pages/Programs'
import Muscles from './pages/Muscles'
import Sessions from './pages/Sessions'
import SessionDetail from './pages/SessionDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Stats from './pages/Stats'

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem('user'))
  const [exercises, setExercises] = useState<any[]>([])

  useEffect(() => {
    fetch('http://localhost:8000/exercises')
      .then(r => r.json())
      .then(data => setExercises(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

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
          <Route path="/sessions" element={<PrivateRoute><Sessions exercises={exercises} /></PrivateRoute>} />
          <Route path="/sessions/:id" element={<PrivateRoute><SessionDetail /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
          <Route path="/programs" element={<PrivateRoute><Programs /></PrivateRoute>} />
          <Route path="/muscles" element={<PrivateRoute><Muscles /></PrivateRoute>} />
          <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/stats" element={<PrivateRoute><Stats /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  )
}
