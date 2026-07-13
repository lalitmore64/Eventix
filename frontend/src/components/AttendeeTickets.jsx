import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Loader2, AlertCircle } from 'lucide-react';

export const AttendeeTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch attendee tickets', err);
    } finally {
      setLoading(false);
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
          My Event Tickets
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Access your entry passes and QR codes for scanning at events.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Tickets Found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't booked any tickets yet. Explore upcoming events to purchase.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          {tickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className="card" 
              style={{ 
                padding: 0, 
                display: 'flex', 
                flexDirection: 'row', 
                overflow: 'hidden', 
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedTicket(ticket)}
            >
              <div style={{ flex: 3, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span className="badge badge-published" style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)', borderColor: 'rgba(168, 85, 247, 0.2)' }}>
                      {ticket.ticketTypeName}
                    </span>
                    <span className={`badge ${ticket.status === 'PURCHASED' ? 'badge-completed' : 'badge-cancelled'}`}>
                      {ticket.status}
                    </span>
                  </div>
                  
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{ticket.eventName}</h2>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                    <Calendar size={14} style={{ color: 'var(--accent-purple)' }} />
                    <span>{new Date(ticket.eventStartDateTime).toLocaleString()}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <MapPin size={14} style={{ color: 'var(--accent-cyan)' }} />
                    <span>{ticket.eventVenue}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '0.75rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Ticket ID: {ticket.id.substring(0, 8)}...</span>
                  <span>Purchased: {new Date(ticket.createdDateTime).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ borderRight: '2px dashed var(--border)', width: 0, margin: '0.5rem 0' }}></div>

              <div style={{ 
                flex: 1, 
                padding: '1.5rem', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: 'rgba(15, 23, 42, 0.4)',
                minWidth: '180px'
              }}>
                {ticket.status === 'PURCHASED' && ticket.qrCode ? (
                  <>
                    <div style={{ background: 'white', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', display: 'inline-block' }}>
                      <QRCodeSVG value={ticket.qrCode.id} size={100} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                      Click to Enlarge
                    </span>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--accent-red)' }}>
                    <AlertCircle size={28} style={{ margin: '0 auto 0.5rem' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>REVOKED</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTicket && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }} onClick={() => setSelectedTicket(null)}>
          <div 
            className="animated-fadeIn" 
            style={{ 
              maxWidth: '400px', 
              width: '90%', 
              textAlign: 'center', 
              padding: '2.5rem', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-md)',
              background: 'hsl(var(--bg-secondary-hsl))'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Entry Pass</h3>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setSelectedTicket(null)}
                style={{ padding: '0.25rem 0.5rem', minWidth: 'auto' }}
              >
                ✕
              </button>
            </div>

            <h2 style={{ fontSize: '1.6rem', color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>{selectedTicket.eventName}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{selectedTicket.eventVenue}</p>

            {selectedTicket.status === 'PURCHASED' && selectedTicket.qrCode ? (
              <>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', display: 'inline-block', marginBottom: '1rem' }}>
                  <QRCodeSVG value={selectedTicket.qrCode.id} size={200} />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px', wordBreak: 'break-all', marginBottom: '1.5rem' }}>
                  QR ID: {selectedTicket.qrCode.id}
                </div>
              </>
            ) : (
              <div style={{ margin: '2rem 0', color: 'var(--accent-red)' }}>
                <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
                <h3>This Ticket is Revoked</h3>
              </div>
            )}

            <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tier:</span>
                <strong style={{ color: 'var(--accent-purple)' }}>{selectedTicket.ticketTypeName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Price:</span>
                <strong style={{ color: 'var(--accent-purple)' }}>₹{selectedTicket.ticketTypePrice.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Purchaser ID:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{selectedTicket.purchaserId.substring(0, 10)}...</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
