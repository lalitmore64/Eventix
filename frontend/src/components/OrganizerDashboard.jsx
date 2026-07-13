import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Calendar, MapPin, Plus, TrendingUp, Users, IndianRupee, CheckCircle, ArrowLeft, Loader2, AlertCircle, FileText } from 'lucide-react';

export const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [report, setReport] = useState(null);
  const [salesLog, setSalesLog] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [salesStartDate, setSalesStartDate] = useState('');
  const [salesEndDate, setSalesEndDate] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [formTicketTypes, setFormTicketTypes] = useState([
    { name: 'General Admission', price: 29.99, totalAvailable: 100 }
  ]);
  const [savingEvent, setSavingEvent] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (eventId) => {
    try {
      setSelectedEventId(eventId);
      setReportLoading(true);
      
      const reportRes = await axios.get(`/api/v1/events/${eventId}/report`);
      setReport(reportRes.data);

      const salesRes = await axios.get(`/api/v1/events/${eventId}/tickets`);
      setSalesLog(salesRes.data);
    } catch (err) {
      console.error('Failed to fetch event reports', err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleAddTicketTypeField = () => {
    setFormTicketTypes([...formTicketTypes, { name: '', price: 0, totalAvailable: null }]);
  };

  const handleRemoveTicketTypeField = (index) => {
    setFormTicketTypes(formTicketTypes.filter((_, i) => i !== index));
  };

  const handleTicketTypeChange = (index, field, value) => {
    const updated = [...formTicketTypes];
    if (field === 'price') {
      updated[index].price = parseFloat(value) || 0;
    } else if (field === 'totalAvailable') {
      updated[index].totalAvailable = value !== '' ? parseInt(value) : null;
    } else {
      updated[index].name = value;
    }
    setFormTicketTypes(updated);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setSavingEvent(true);
      const newEvent = {
        name,
        venue,
        startDateTime: new Date(startDateTime).toISOString(),
        endDateTime: new Date(endDateTime).toISOString(),
        salesStartDate: salesStartDate ? new Date(salesStartDate).toISOString() : null,
        salesEndDate: salesEndDate ? new Date(salesEndDate).toISOString() : null,
        status,
        ticketTypes: formTicketTypes.filter(t => t.name.trim() !== '')
      };

      await axios.post('/api/v1/events', newEvent);
      setShowCreateModal(false);
      
      setName('');
      setVenue('');
      setStartDateTime('');
      setEndDateTime('');
      setSalesStartDate('');
      setSalesEndDate('');
      setStatus('DRAFT');
      setFormTicketTypes([{ name: 'General Admission', price: 29.99, totalAvailable: 100 }]);

      fetchEvents();
    } catch (err) {
      console.error('Failed to save event', err);
    } finally {
      setSavingEvent(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--accent-cyan)' }} />
      </div>
    );
  }

  if (selectedEventId && report) {
    const checkinPercentage = report.totalTicketsSold > 0 
      ? Math.round((report.totalCheckedIn / report.totalTicketsSold) * 100) 
      : 0;

    return (
      <div className="animated-fadeIn">
        <button 
          className="btn btn-secondary btn-sm" 
          style={{ marginBottom: '1.5rem' }} 
          onClick={() => { setSelectedEventId(null); setReport(null); setSalesLog([]); }}
        >
          <ArrowLeft size={16} />
          Back to Events
        </button>

        {reportLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 className="animate-spin" size={36} style={{ color: 'var(--accent-cyan)' }} />
          </div>
        ) : (
          <>
            <div className="responsive-header">
              <div>
                <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>{report.eventName}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Event Sales & Attendance Metrics Overview</p>
              </div>
              <span className={`badge ${events.find(e => e.id === selectedEventId)?.status === 'PUBLISHED' ? 'badge-published' : 'badge-draft'}`}>
                {events.find(e => e.id === selectedEventId)?.status}
              </span>
            </div>

            <div className="grid-3" style={{ marginBottom: '2rem' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                  <IndianRupee size={28} style={{ color: 'var(--accent-purple)' }} />
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Revenue</span>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>₹{report.totalRevenue.toFixed(2)}</h2>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                  <Users size={28} style={{ color: 'var(--accent-cyan)' }} />
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tickets Sold</span>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                    {report.totalTicketsSold}
                    {report.totalCapacity && <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> / {report.totalCapacity}</span>}
                  </h2>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                  <CheckCircle size={28} style={{ color: 'var(--accent-green)' }} />
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Checked In Rate</span>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                    {checkinPercentage}%
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}> ({report.totalCheckedIn} / {report.totalTicketsSold})</span>
                  </h2>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Sales Breakdown by Tier</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Tier Name</th>
                      <th>Price</th>
                      <th>Sold Count</th>
                      <th>Revenue</th>
                      <th>Checked In</th>
                      <th>Cap Limit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.salesByTicketType.map((tt) => (
                      <tr key={tt.ticketTypeId}>
                        <td style={{ fontWeight: '500' }}>{tt.name}</td>
                        <td>₹{tt.price.toFixed(2)}</td>
                        <td>{tt.ticketsSold}</td>
                        <td style={{ fontWeight: '600', color: 'var(--accent-cyan)' }}>₹{tt.revenue.toFixed(2)}</td>
                        <td>{tt.checkedIn}</td>
                        <td>{tt.totalAvailable ?? 'Unlimited'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} />
                Recent Ticket Sales Log
              </h2>
              {salesLog.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No ticket purchases recorded yet.</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Purchaser Subject ID</th>
                        <th>Tier</th>
                        <th>Purchased Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesLog.map((ticket) => (
                        <tr key={ticket.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{ticket.id}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ticket.purchaserId}</td>
                          <td>
                            <span className="badge badge-published" style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)' }}>
                              {ticket.ticketTypeName}
                            </span>
                          </td>
                          <td>{new Date(ticket.createdDateTime).toLocaleString()}</td>
                          <td>
                            <span className={`badge ${ticket.status === 'PURCHASED' ? 'badge-completed' : 'badge-cancelled'}`}>
                              {ticket.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="animated-fadeIn">
      <div className="responsive-header">
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Event Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create events, publish configurations, and analyze sales performance.</p>
        </div>
        
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          Create New Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Managed Events</h3>
          <p style={{ color: 'var(--text-muted)' }}>You haven't configured any events yet. Click "Create New Event" to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map((event) => (
            <div 
              key={event.id} 
              className="card organizer-event-card"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{event.name}</h3>
                  <span className={`badge ${event.status === 'PUBLISHED' ? 'badge-published' : 'badge-draft'}`}>
                    {event.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} style={{ color: 'var(--accent-purple)' }} />
                    {new Date(event.startDateTime).toLocaleDateString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={14} style={{ color: 'var(--accent-cyan)' }} />
                    {event.venue}
                  </span>
                  <span>Tiers: {event.ticketTypes.length}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleViewReport(event.id)}>
                  <TrendingUp size={16} />
                  Analytics Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
          overflowY: 'auto', padding: '6rem 1rem 2rem 1rem', zIndex: 1000
        }}>
          <div className="animated-fadeIn" style={{
            maxWidth: '750px',
            width: '95%',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.75rem' }}>Configure New Event</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)} style={{ padding: '0.25rem 0.5rem', minWidth: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleCreateEvent}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Event Name</label>
                    <input type="text" className="form-control" placeholder="E.g., Tech Innovators Conference" required value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Venue Location</label>
                    <input type="text" className="form-control" placeholder="E.g., Grand Plaza Hall, New York" required value={venue} onChange={e => setVenue(e.target.value)} />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Date & Time</label>
                    <input type="datetime-local" className="form-control" required value={startDateTime} onChange={e => setStartDateTime(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date & Time</label>
                    <input type="datetime-local" className="form-control" required value={endDateTime} onChange={e => setEndDateTime(e.target.value)} />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Sales Start Date (Optional)</label>
                    <input type="datetime-local" className="form-control" value={salesStartDate} onChange={e => setSalesStartDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sales End Date (Optional)</label>
                    <input type="datetime-local" className="form-control" value={salesEndDate} onChange={e => setSalesEndDate(e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Publishing Status</label>
                  <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="DRAFT">DRAFT (Saves details privately)</option>
                    <option value="PUBLISHED">PUBLISHED (Goes live immediately)</option>
                  </select>
                </div>

                <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>Configure Ticket Tiers</h3>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddTicketTypeField}>
                      <Plus size={14} /> Add Tier
                    </button>
                  </div>

                  {formTicketTypes.map((tt, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', background: 'rgba(255,255,255,0.01)', padding: '0.75rem', borderRadius: '8px' }}>
                      <div style={{ flex: 3 }}>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Tier Name (e.g., VIP)" 
                          required 
                          value={tt.name}
                          onChange={e => handleTicketTypeChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div style={{ flex: 2 }}>
                        <input 
                          type="number" 
                          step="0.01" 
                          className="form-control" 
                          placeholder="Price (₹)" 
                          required 
                          min="0"
                          value={tt.price ?? ''}
                          onChange={e => handleTicketTypeChange(index, 'price', e.target.value)}
                        />
                      </div>
                      <div style={{ flex: 2 }}>
                        <input 
                          type="number" 
                          className="form-control" 
                          placeholder="Qty Limit (Empty for Unlim.)" 
                          min="1"
                          value={tt.totalAvailable === null ? '' : tt.totalAvailable}
                          onChange={e => handleTicketTypeChange(index, 'totalAvailable', e.target.value)}
                        />
                      </div>
                      {formTicketTypes.length > 1 && (
                        <button type="button" className="btn btn-danger btn-sm" style={{ padding: '0.6rem 0.8rem' }} onClick={() => handleRemoveTicketTypeField(index)}>
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

              <div style={{ display: 'flex', gap: '1rem', flexShrink: 0, borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={savingEvent}>
                  {savingEvent ? 'Saving...' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
