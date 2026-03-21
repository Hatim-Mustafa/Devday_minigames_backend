import { NavLink } from 'react-router-dom';

export default function NavBar({ onLogout }) {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        DEV_DAY_24
      </NavLink>
      <div className="navbar-links">
        <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/minigames/new" className={({ isActive }) => isActive ? 'active' : ''}>
          New Minigame
        </NavLink>
        <NavLink to="/admin/scores" className={({ isActive }) => isActive ? 'active' : ''}>
          Scores
        </NavLink>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
