import { Link, useLocation } from 'react-router-dom';
import { FileText, Plus, Home, Settings, Layers, LogOut } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ onLogout }) {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/proposals', label: 'Proposals', icon: FileText },
    { to: '/proposals/new', label: 'New', icon: Plus },
  ];

  return (
    <nav className="navbar glass" id="main-navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">
            <Layers size={22} />
          </div>
          <span className="navbar-title">
            Proposal<span className="text-gradient">Manager</span>
          </span>
        </Link>

        <div className="navbar-links">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar-link ${isActive ? 'active' : ''}`}
                id={`nav-${link.label.toLowerCase()}`}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="navbar-actions">
          <button className="btn btn-ghost btn-icon" onClick={onLogout} id="logout-btn" title="Logout">
            <LogOut size={18} />
          </button>
          <Link to="/settings" className="btn btn-ghost btn-icon" id="settings-btn" title="Settings">
            <Settings size={18} />
          </Link>
          <div className="navbar-avatar" id="user-avatar" title="Admin">
            <span>AD</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
