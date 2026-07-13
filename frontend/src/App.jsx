import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { Navbar } from './components/Navbar';
import { EventDiscovery } from './components/EventDiscovery';
import { AttendeeTickets } from './components/AttendeeTickets';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { StaffValidator } from './components/StaffValidator';
import { AuthModal } from './components/AuthModal';
import { Sparkles, Loader2 } from 'lucide-react';

const AppContent = () => {
  const { loading, authenticated, login } = useAuth();
  const [currentView, setView] = useState(() => sessionStorage.getItem('currentView') || 'discover');

  React.useEffect(() => {
    sessionStorage.setItem('currentView', currentView);
  }, [currentView]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--accent-cyan)', marginBottom: '1rem' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>Initializing Security Context...</h3>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'discover':
        return <EventDiscovery />;
      case 'my-tickets':
        return authenticated ? <AttendeeTickets /> : <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><h3>Please login to see your tickets.</h3><button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={login}>Login</button></div>;
      case 'organizer':
        return authenticated ? <OrganizerDashboard /> : <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><h3>Access Denied</h3></div>;
      case 'staff':
        return authenticated ? <StaffValidator /> : <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><h3>Access Denied</h3></div>;
      default:
        return <EventDiscovery />;
    }
  };

  return (
    <div className="app-container">
      <Navbar currentView={currentView} setView={setView} />
      <main className="main-content">
        {renderView()}
      </main>
      <AuthModal />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
