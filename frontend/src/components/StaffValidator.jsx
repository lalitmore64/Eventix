import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, XCircle, Users, Loader2, RefreshCw } from 'lucide-react';

export const StaffValidator = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/published-events');
      setEvents(res.data);
      if (res.data.length > 0) {
        handleSelectEvent(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch events for validation', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = async (event) => {
    setSelectedEvent(event);
    setValidationResult(null);
    setQrCodeInput('');
    fetchEventTicketsForSimulation(event.id);
  };

  const fetchEventTicketsForSimulation = async (eventId) => {
    try {
      setTicketsLoading(true);
      const res = await axios.get(`/api/v1/events/${eventId}/tickets`);
      setPurchasedTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch tickets for simulation helper', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleValidate = async (qrId) => {
    if (!qrId.trim()) return;
    try {
      setValidating(true);
      setValidationResult(null);
      const res = await axios.post('/api/v1/tickets/validate', {
        qrCodeId: qrId,
        validationMethod: 'QR_SCAN'
      });
      setValidationResult(res.data);
      if (selectedEvent) {
        fetchEventTicketsForSimulation(selectedEvent.id);
      }
    } catch (err) {
      setValidationResult({
        status: 'FAILED',
        message: err.response?.data?.message || 'Server error occurred during validation.'
      });
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--accent-cyan)' }} />
      </div>
    );
  }

  return (
    <div className="animated-fadeIn">
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Ticket Gate Validation
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Scan QR codes or check ticket references to validate entry permissions.</p>
      </div>

      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Select active event gate</h2>
            <div className="form-group">
              <select 
                className="form-control"
                value={selectedEvent?.id || ''}
                onChange={(e) => {
                  const ev = events.find(event => event.id === e.target.value);
                  if (ev) handleSelectEvent(ev);
                }}
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.venue})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Validate Ticket QR Code</h2>
            <div className="form-group" style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Paste QR Code ID / Scan Value..." 
                value={qrCodeInput}
                onChange={e => setQrCodeInput(e.target.value)}
              />
              <button 
                className="btn btn-primary"
                onClick={() => handleValidate(qrCodeInput)}
                disabled={validating}
              >
                Validate
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Tip: Copy a QR ID from the simulator helper on the right and paste it here, or click it in the list to scan automatically.
            </p>
          </div>

          {validationResult && (
            <div 
              className="card animated-fadeIn"
              style={{
                background: validationResult.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                borderColor: validationResult.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                boxShadow: validationResult.status === 'SUCCESS' ? '0 0 20px rgba(16, 185, 129, 0.15)' : '0 0 20px rgba(239, 68, 68, 0.15)',
                textAlign: 'center',
                padding: '2rem'
              }}
            >
              {validationResult.status === 'SUCCESS' ? (
                <>
                  <CheckCircle2 size={48} style={{ color: 'var(--accent-green)', margin: '0 auto 1rem' }} />
                  <h2 style={{ color: 'var(--accent-green)', fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: '800' }}>
                    ACCESS GRANTED
                  </h2>
                  <p style={{ fontWeight: '500', marginBottom: '1.5rem', color: '#fff' }}>{validationResult.message}</p>
                  
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', textAlign: 'left', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Event:</span>
                      <strong>{validationResult.eventName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Tier:</span>
                      <strong>{validationResult.ticketTypeName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Purchaser ID:</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{validationResult.purchaserId}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <XCircle size={48} style={{ color: 'var(--accent-red)', margin: '0 auto 1rem' }} />
                  <h2 style={{ color: 'var(--accent-red)', fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: '800' }}>
                    ACCESS DENIED
                  </h2>
                  <p style={{ color: 'var(--text-primary)', fontWeight: '500', marginBottom: '0.5rem' }}>
                    {validationResult.message}
                  </p>
                  {validationResult.ticketId && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ticket ID: {validationResult.ticketId}</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} style={{ color: 'var(--accent-cyan)' }} />
              QR Scan Simulation Helper
            </h2>
            <button 
              className="btn btn-secondary btn-sm" 
              style={{ padding: '0.25rem 0.5rem', minWidth: 'auto' }}
              onClick={() => selectedEvent && fetchEventTicketsForSimulation(selectedEvent.id)}
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Below is a list of all purchased tickets for the selected event. Click on any row to instantly simulate scanning its QR Code.
          </p>

          {ticketsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Loader2 className="animate-spin" size={24} style={{ color: 'var(--accent-cyan)' }} />
            </div>
          ) : purchasedTickets.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No tickets sold for this event yet.</p>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '6px' }}>
              {purchasedTickets.map((t) => (
                <div 
                  key={t.id} 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.01)',
                    transition: 'background var(--transition-fast)'
                  }}
                  onClick={() => {
                    if (t.qrCode) {
                      setQrCodeInput(t.qrCode.id);
                      handleValidate(t.qrCode.id);
                    }
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; }}
                >
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{t.ticketTypeName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      QR ID: {t.qrCode?.id.substring(0, 8)}...
                    </div>
                  </div>
                  <span className={`badge ${t.status === 'PURCHASED' ? 'badge-published' : 'badge-cancelled'}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
