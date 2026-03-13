import { NavLink } from 'react-router-dom';

export default function NavBar({ onLogout }) {
  return (
    <nav className="navbar">
      <span className="navbar-brand">🎮 Devday Admin</span>
      <div className="navbar-links">
        <NavLink to="/minigames" className={({ isActive }) => isActive ? 'active' : ''}>
          Minigames
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>
          Participants
        </NavLink>
        <NavLink to="/scores" className={({ isActive }) => isActive ? 'active' : ''}>
          Scores
        </NavLink>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
