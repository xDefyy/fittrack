import { NavLink, useNavigate } from 'react-router-dom'

interface Props {
  onLogout: () => void
}

export default function Navbar({ onLogout }: Props) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  function logout() {
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <span className="navbar-logo">FitTrack</span>
      <div className="navbar-links">
        <NavLink to="/sessions" className={({ isActive }) => isActive ? 'active' : ''}>Sessions</NavLink>
        <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>Users</NavLink>
        <NavLink to="/programs" className={({ isActive }) => isActive ? 'active' : ''}>Programs</NavLink>
        <NavLink to="/muscles" className={({ isActive }) => isActive ? 'active' : ''}>Muscles</NavLink>
      </div>
      <div className="navbar-user">
        <span className="navbar-name">{user.name}</span>
        <button onClick={logout} className="navbar-logout">Logout</button>
      </div>
    </nav>
  )
}
