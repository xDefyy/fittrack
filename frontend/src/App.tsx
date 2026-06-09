import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Users from './pages/Users'
import Programs from './pages/Programs'
import Muscles from './pages/Muscles'
import Login from './pages/Login'
import Register from './pages/Register'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('user')
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const user = localStorage.getItem('user')

  return (
    <div className="app">
      {user && <Navbar />}
      <main className="main">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Navigate to="/users" replace /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
          <Route path="/programs" element={<PrivateRoute><Programs /></PrivateRoute>} />
          <Route path="/muscles" element={<PrivateRoute><Muscles /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  )
}
