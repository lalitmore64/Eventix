import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { LogIn, LogOut, Calendar, Menu, X } from 'lucide-react';

export const Navbar = ({ currentView, setView }) => {
  const { authenticated, username, roles, login, logout, hasRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (view) => {
    setView(view);
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => handleNavClick('discover')}>
          <Calendar size={28} className="icon-cyan" />
          <span>Eventix</span>
        </div>

        {/* Mobile menu toggle button */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsOpen(!isOpen)} 
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop links */}
        <ul className="nav-links desktop-only">
          <li 
            className={`nav-link ${currentView === 'discover' ? 'active' : ''}`}
            onClick={() => setView('discover')}
          >
            Discover
          </li>

          {authenticated && (
            <li 
              className={`nav-link ${currentView === 'my-tickets' ? 'active' : ''}`}
              onClick={() => setView('my-tickets')}
            >
              My Tickets
            </li>
          )}

          {authenticated && hasRole('organizer') && (
            <li 
              className={`nav-link ${currentView === 'organizer' ? 'active' : ''}`}
              onClick={() => setView('organizer')}
            >
              Organizer Dashboard
            </li>
          )}

          {authenticated && (hasRole('staff') || hasRole('organizer')) && (
            <li 
              className={`nav-link ${currentView === 'staff' ? 'active' : ''}`}
              onClick={() => setView('staff')}
            >
              Ticket Scanning
            </li>
          )}
        </ul>

        {/* Desktop user section */}
        <div className="user-section desktop-only">
          {authenticated ? (
            <>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Hi, <strong style={{ color: 'var(--text-primary)' }}>{username}</strong> 
                {roles.length > 0 && ` (${roles.filter(r => ['organizer', 'staff', 'attendee'].includes(r)).join(', ')})`}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={logout}>
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={login}>
              <LogIn size={16} />
              Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="mobile-drawer animated-fadeIn">
          <ul className="mobile-nav-links">
            <li 
              className={`mobile-nav-link ${currentView === 'discover' ? 'active' : ''}`}
              onClick={() => handleNavClick('discover')}
            >
              Discover
            </li>

            {authenticated && (
              <li 
                className={`mobile-nav-link ${currentView === 'my-tickets' ? 'active' : ''}`}
                onClick={() => handleNavClick('my-tickets')}
              >
                My Tickets
              </li>
            )}

            {authenticated && hasRole('organizer') && (
              <li 
                className={`mobile-nav-link ${currentView === 'organizer' ? 'active' : ''}`}
                onClick={() => handleNavClick('organizer')}
              >
                Organizer Dashboard
              </li>
            )}

            {authenticated && (hasRole('staff') || hasRole('organizer')) && (
              <li 
                className={`mobile-nav-link ${currentView === 'staff' ? 'active' : ''}`}
                onClick={() => handleNavClick('staff')}
              >
                Ticket Scanning
              </li>
            )}
          </ul>

          <div className="mobile-user-section">
            {authenticated ? (
              <>
                <div className="mobile-username">
                  Hi, <strong style={{ color: 'var(--text-primary)' }}>{username}</strong>
                  <span className="mobile-role-text">
                    {roles.length > 0 && ` (${roles.filter(r => ['organizer', 'staff', 'attendee'].includes(r)).join(', ')})`}
                  </span>
                </div>
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ width: '100%', justifyContent: 'center' }} 
                  onClick={() => { logout(); setIsOpen(false); }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <button 
                className="btn btn-primary btn-sm" 
                style={{ width: '100%', justifyContent: 'center' }} 
                onClick={() => { login(); setIsOpen(false); }}
              >
                <LogIn size={16} />
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
