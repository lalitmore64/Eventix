import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Calendar, MapPin, Ticket, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export const EventDiscovery = () => {
  const { authenticated, login } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [checkoutStep, setCheckoutStep] = useState('details');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentOrderDetails, setPaymentOrderDetails] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/published-events');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch published events', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPurchase = (event) => {
    setSelectedEvent(event);
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      setSelectedTicketType(event.ticketTypes[0]);
    }
    setQuantity(1);
    setCheckoutStep('details');
    setErrorMessage('');
    setPaymentOrderDetails(null);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePurchase = async (e) => {
    e.preventDefault();
    if (!authenticated) {
      login();
      return;
    }
    setCheckoutStep('processing');
    setErrorMessage('');
    
    try {
      const res = await axios.post('/api/v1/tickets/purchase', {
        ticketTypeId: selectedTicketType?.id,
        quantity: quantity
      });
      
      const orderData = res.data;
      setPaymentOrderDetails(orderData);
      
      if (orderData.isFree) {
        setCheckoutStep('success');
        fetchEvents();
        return;
      }
      
      if (orderData.razorpayKey === 'rzp_test_mockKeyId') {
        setCheckoutStep('mock_payment');
      } else {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setErrorMessage('Failed to load Razorpay payment SDK. Please try again.');
          setCheckoutStep('error');
          return;
        }
        
        const options = {
          key: orderData.razorpayKey,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Eventix",
          description: `Ticket Purchase for ${selectedEvent.name}`,
          order_id: orderData.paymentOrderId,
          handler: async function (paymentRes) {
            try {
              setCheckoutStep('processing');
              await axios.post('/api/v1/tickets/purchase/verify', {
                razorpayPaymentId: paymentRes.razorpay_payment_id,
                razorpayOrderId: paymentRes.razorpay_order_id,
                razorpaySignature: paymentRes.razorpay_signature
              });
              setCheckoutStep('success');
              fetchEvents();
            } catch (err) {
              setErrorMessage(err.response?.data?.message || 'Payment verification failed.');
              setCheckoutStep('error');
            }
          },
          prefill: {
            name: "Attendee Name",
            email: "attendee@example.com"
          },
          theme: {
            color: "#06b6d4"
          },
          modal: {
            ondismiss: function() {
              setCheckoutStep('details');
            }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to initiate checkout.');
      setCheckoutStep('error');
    }
  };

  const handleSimulatePayment = async (simulateSuccess) => {
    if (!simulateSuccess) {
      setErrorMessage('Sandbox payment simulation was cancelled/failed.');
      setCheckoutStep('error');
      return;
    }
    
    setCheckoutStep('processing');
    try {
      const mockPaymentId = 'pay_mock_' + Math.random().toString(36).substring(2, 10);
      const mockSignature = 'sig_mock_' + Math.random().toString(36).substring(2, 10);
      
      await axios.post('/api/v1/tickets/purchase/verify', {
        razorpayPaymentId: mockPaymentId,
        razorpayOrderId: paymentOrderDetails.paymentOrderId,
        razorpaySignature: mockSignature
      });
      
      setCheckoutStep('success');
      fetchEvents();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to verify simulated payment.');
      setCheckoutStep('error');
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
          Upcoming Live Events
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Book tickets to the most popular concerts and conferences.</p>
      </div>

      {events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Events Available</h3>
          <p style={{ color: 'var(--text-muted)' }}>There are currently no events open for ticket sales. Please check back later.</p>
        </div>
      ) : (
        <div className="grid-3">
          {events.map((event) => (
            <div key={event.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{event.name}</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <Calendar size={16} style={{ color: 'var(--accent-purple)' }} />
                  <span>{new Date(event.startDateTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  <MapPin size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <span>{event.venue}</span>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ticket Types</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {event.ticketTypes.map((tt) => (
                      <div key={tt.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', background: 'rgba(255,255,255,0.02)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                        <span>{tt.name}</span>
                        <strong style={{ color: 'var(--accent-cyan)' }}>
                          ₹{tt.price.toFixed(2)}
                          {tt.totalAvailable !== null && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                              ({tt.totalAvailable} left)
                            </span>
                          )}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={() => handleOpenPurchase(event)}
              >
                <Ticket size={18} />
                Get Tickets
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedEvent && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="animated-fadeIn" style={{
            maxWidth: '500px', width: '90%', margin: '1rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.6rem' }}>Checkout</h2>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setSelectedEvent(null)}
                style={{ padding: '0.25rem 0.5rem', minWidth: 'auto' }}
              >
                ✕
              </button>
            </div>

            {checkoutStep === 'details' && (
              <form onSubmit={handleInitiatePurchase}>
                <h3 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>{selectedEvent.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{selectedEvent.venue}</p>

                <div className="form-group">
                  <label className="form-label">Select Ticket Tier</label>
                  <select 
                    className="form-control"
                    value={selectedTicketType?.id || ''}
                    onChange={(e) => {
                      const found = selectedEvent.ticketTypes.find(t => t.id === e.target.value);
                      if (found) setSelectedTicketType(found);
                    }}
                  >
                    {selectedEvent.ticketTypes.map(tt => (
                      <option key={tt.id} value={tt.id}>
                        {tt.name} - ₹{tt.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    min="1" 
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 1rem', padding: '1rem 0', borderTop: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Price</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                    ₹{((selectedTicketType?.price || 0) * quantity).toFixed(2)}
                  </span>
                </div>

                {authenticated ? (
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                    Proceed to Payment
                  </button>
                ) : (
                  <button type="button" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={login}>
                    Login to Book Tickets
                  </button>
                )}
              </form>
            )}

            {checkoutStep === 'payment_sim' && paymentOrderDetails && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <Loader2 className="spinner" size={40} style={{ margin: '0 auto 1.5rem', color: 'var(--accent-purple)' }} />
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Processing Payment...</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  Please complete the payment in the Razorpay sandbox window.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setCheckoutStep('details')}>
                    Back to details
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 'mock_payment' && (
              <div>
                <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Developer Sandbox Simulator
                  </span>
                  <h4 style={{ margin: '0.5rem 0 0.25rem', color: 'var(--text-primary)' }}>Simulated Razorpay Checkout</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Mock keys detected. Click below to simulate Razorpay payment outcomes.
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Event:</span>
                    <span style={{ fontWeight: 500 }}>{selectedEvent.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tier / Quantity:</span>
                    <span>{quantity}x {selectedTicketType?.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Amount Due:</span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>₹{((selectedTicketType?.price || 0) * quantity).toFixed(2)}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', border: 'none', width: '100%' }}
                    onClick={() => handleSimulatePayment(true)}
                  >
                    Simulate Successful Payment
                  </button>
                  <button 
                    type="button" 
                    className="btn" 
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', border: '1px solid rgba(239, 68, 68, 0.2)', width: '100%' }}
                    onClick={() => handleSimulatePayment(false)}
                  >
                    Simulate Payment Failure
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ width: '100%' }}
                    onClick={() => setCheckoutStep('details')}
                  >
                    Cancel Transaction
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <Loader2 className="animate-spin" size={48} style={{ color: 'var(--accent-purple)', margin: '0 auto 1.5rem' }} />
                <h3>Securing Ticket Booking...</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Please wait, performing concurrency validation and processing payment.</p>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle2 size={56} style={{ color: 'var(--accent-green)', margin: '0 auto 1.5rem' }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Booking Confirmed!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  Successfully purchased <strong>{quantity}x {selectedTicketType?.name}</strong> tickets to <strong>{selectedEvent.name}</strong>.
                </p>
                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px dashed rgba(16, 185, 129, 0.2)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                  Tickets have been saved to your account. You can access their QR codes inside the <strong>My Tickets</strong> tab.
                </div>
                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setSelectedEvent(null)}>
                  Close Window
                </button>
              </div>
            )}

            {checkoutStep === 'error' && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <AlertCircle size={56} style={{ color: 'var(--accent-red)', margin: '0 auto 1.5rem' }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--accent-red)' }}>Transaction Failed</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  {errorMessage || 'Something went wrong when trying to book tickets. The event might be sold out or ticket sales ended.'}
                </p>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setCheckoutStep('details')}>
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
