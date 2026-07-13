import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { LogIn, UserPlus, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export const AuthModal = () => {
  const { showAuthModal, setShowAuthModal, submitLogin, submitRegister } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  
  // Login fields
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // Register fields
  const [regUser, setRegUser] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regRole, setRegRole] = useState('ATTENDEE');

  // Common UI states
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setErrorMsg('');
    setLoginUser('');
    setLoginPass('');
    setRegUser('');
    setRegEmail('');
    setRegPass('');
    setRegRole('ATTENDEE');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    const res = await submitLogin(loginUser, loginPass);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      handleClose();
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regUser.trim() || !regEmail.trim() || !regPass.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    const res = await submitRegister(regUser, regEmail, regPass, regRole);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      handleClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
    }} onClick={handleClose}>
      <div 
        className="animated-fadeIn" 
        style={{ 
          maxWidth: '440px', 
          width: '90%', 
          padding: '2rem', 
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius-md)',
          background: 'hsl(var(--bg-card-hsl))',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={handleClose}
          style={{ 
            position: 'absolute', top: '1.25rem', right: '1.25rem',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.25rem', color: 'var(--text-muted)'
          }}
        >
          ✕
        </button>

        {/* Tab Headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', gap: '1.5rem' }}>
          <button 
            style={{
              background: 'none', border: 'none', paddingBottom: '0.75rem',
              fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer',
              color: activeTab === 'login' ? 'var(--accent-purple)' : 'var(--text-muted)',
              borderBottom: activeTab === 'login' ? '2px solid var(--accent-purple)' : '2px solid transparent'
            }}
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
          >
            Sign In
          </button>
          <button 
            style={{
              background: 'none', border: 'none', paddingBottom: '0.75rem',
              fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer',
              color: activeTab === 'register' ? 'var(--accent-purple)' : 'var(--text-muted)',
              borderBottom: activeTab === 'register' ? '2px solid var(--accent-purple)' : '2px solid transparent'
            }}
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', 
            padding: '0.75rem', borderRadius: '6px', color: 'var(--accent-red)', 
            fontSize: '0.85rem', marginBottom: '1.25rem' 
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Enter username" 
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                required 
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPass ? 'text' : 'password'} 
                  className="form-control" 
                  placeholder="••••••••" 
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  required 
                />
                <button 
                  type="button"
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                  }}
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Choose username" 
                value={regUser}
                onChange={(e) => setRegUser(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="you@example.com" 
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPass ? 'text' : 'password'} 
                  className="form-control" 
                  placeholder="••••••••" 
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  required 
                />
                <button 
                  type="button"
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                  }}
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Account Role</label>
              <select 
                className="form-control"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
              >
                <option value="ATTENDEE">Attendee</option>
                <option value="ORGANIZER">Organizer</option>
                <option value="STAFF">Staff Member</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
