import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Users from './pages/Users'
import Programs from './pages/Programs'
import Muscles from './pages/Muscles'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/users" replace />} />
          <Route path="/users" element={<Users />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/muscles" element={<Muscles />} />
        </Routes>
      </main>
    </div>
  )
}
