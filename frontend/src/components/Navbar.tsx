import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-logo">FitTrack</span>
      <div className="navbar-links">
        <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>
          Users
        </NavLink>
        <NavLink to="/programs" className={({ isActive }) => isActive ? 'active' : ''}>
          Programs
        </NavLink>
        <NavLink to="/muscles" className={({ isActive }) => isActive ? 'active' : ''}>
          Muscles
        </NavLink>
      </div>
    </nav>
  )
}
