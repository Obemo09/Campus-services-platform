import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/index.js';
import useIsMobile from '../hooks/useIsMobile';
import PageHero from '../components/PageHero.jsx';

const inputStyle = {
  width: '100%', background: 'var(--navy)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fff',
  fontFamily: 'var(--font-body)', outline: 'none'
};

const labelStyle = {
  fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em',
  display: 'block', marginBottom: 6, textTransform: 'uppercase'
};

export default function Carpooling() {
  const isMobile = useIsMobile();
  const [rides, setRides] = useState([]);
  const [myRides, setMyRides] = useState([]);
  const [joinedRides, setJoinedRides] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [loading, setLoading] = useState(false);
  const [expandedPassengers, setExpandedPassengers] = useState(null);
  const [form, setForm] = useState({ from: '', to: '', date: '', departureTime: '', availableSeats: 1, pricePerSeat: 0, notes: '' });

  const userId = localStorage.getItem('userId');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    await Promise.allSettled([fetchRides(), fetchMyRides(), fetchJoinedRides()]);
  };

  const fetchRides = async () => {
    try { const res = await api.get('/carpooling'); setRides(res.data.rides); }
    catch (err) { console.error(err); }
  };

  const fetchMyRides = async () => {
    try { const res = await api.get('/carpooling/my'); setMyRides(res.data.rides); }
    catch (err) { console.error(err); }
  };

  const fetchJoinedRides = async () => {
    try { const res = await api.get('/carpooling/joined'); setJoinedRides(res.data.rides); }
    catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/carpooling', form);
      toast.success('Ride posted!');
      fetchAll(); setActiveTab('my');
      setForm({ from: '', to: '', date: '', departureTime: '', availableSeats: 1, pricePerSeat: 0, notes: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setLoading(false); }
  };

  const handleJoin = async (id) => {
    try { await api.post(`/carpooling/${id}/join`); toast.success('Joined ride!'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to join.'); }
  };

  const handleLeave = async (id) => {
    try { await api.delete(`/carpooling/${id}/leave`); toast.success('Left ride.'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const handleCancel = async (id) => {
    try { await api.patch(`/carpooling/${id}/cancel`); toast.success('Ride cancelled.'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const isPassenger = (ride) => ride.passengers?.some(p => p.userId === userId);
  const hasJoinedAny = joinedRides.length > 0;

  const tabs = [
    { key: 'browse', label: 'Available Rides' },
    { key: 'joined', label: `Joined${joinedRides.length > 0 ? ` (${joinedRides.length})` : ''}` },
    { key: 'post', label: 'Post a Ride' },
    { key: 'my', label: `My Rides${myRides.length > 0 ? ` (${myRides.length})` : ''}` },
  ];

  return (
    <div>
      <PageHero icon="🚗" title="Campus Carpooling" subtitle="Share rides, cut costs, and travel safely with fellow students." color="#4ade80" action={() => setActiveTab('post')} actionLabel="+ Post a Ride" />

      <div style={{ padding: isMobile ? '12px' : '18px 28px', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--navy-3)', borderRadius: 8, padding: 3, width: 'fit-content' }}>
          {tabs.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 12, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
              background: activeTab === key ? 'var(--navy-4)' : 'transparent',
              color: activeTab === key ? '#fff' : 'var(--muted)',
              fontWeight: activeTab === key ? 500 : 400
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: isMobile ? '16px' : '24px 28px' }}>

        {activeTab === 'browse' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 14 }}>
            {rides.length === 0 ? (
              <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--muted)', gridColumn: 'span 2' }}>
                No rides available. Be the first to post one!
              </div>
            ) : rides.map(ride => {
              const alreadyJoined = isPassenger(ride);
              const isDriver = ride.driverId === userId;
              return (
                <div key={ride._id} style={{ background: 'var(--navy-3)', border: `1px solid ${alreadyJoined ? 'rgba(201,168,76,0.3)' : 'var(--border)'}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--cream)' }}>📍 {ride.from} → {ride.to}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {alreadyJoined && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--gold-dim)', color: 'var(--gold-light)' }}>Joined</span>}
                      <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: ride.status === 'open' ? 'rgba(74,222,128,0.1)' : 'var(--card-bg)', color: ride.status === 'open' ? '#4ade80' : 'var(--muted)' }}>{ride.status}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.8 }}>
                    <div>👤 {ride.driverName}</div>
                    <div>📅 {new Date(ride.date).toDateString()} at {ride.departureTime}</div>
                    <div>💺 {ride.passengers?.length || 0} / {ride.availableSeats} seats taken</div>
                    {ride.notes && <div style={{ fontStyle: 'italic' }}>"{ride.notes}"</div>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--gold-light)' }}>{ride.pricePerSeat?.toLocaleString()} FCFA</div>
                    <div>
                      {!isDriver && ride.status === 'open' && !alreadyJoined && !hasJoinedAny && (
                        <button onClick={() => handleJoin(ride._id)} style={{ background: 'var(--gold)', color: 'var(--navy)', border: 'none', padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Join Ride</button>
                      )}
                      {!isDriver && hasJoinedAny && !alreadyJoined && (
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>Leave current ride first</span>
                      )}
                      {alreadyJoined && (
                        <button onClick={() => handleLeave(ride._id)} style={{ background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: 11, padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Leave Ride</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'joined' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {joinedRides.length === 0 ? (
              <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--muted)' }}>You haven't joined any rides yet.</div>
            ) : joinedRides.map(ride => (
              <div key={ride._id} style={{ background: 'var(--navy-3)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--cream)', marginBottom: 4 }}>📍 {ride.from} → {ride.to}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.8 }}>
                      <div>📅 {new Date(ride.date).toDateString()} at {ride.departureTime}</div>
                      <div>💺 {ride.passengers?.length || 0} / {ride.availableSeats} seats</div>
                      <div>💰 {ride.pricePerSeat?.toLocaleString()} FCFA per seat</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>{ride.status}</span>
                </div>
                <div style={{ background: 'var(--navy)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>DRIVER CONTACT</div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>👤 {ride.driverName}</div>
                  {ride.driverPhone && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a href={`tel:${ride.driverPhone}`} style={{ flex: 1, textAlign: 'center', padding: '6px 0', background: 'rgba(74,222,128,0.1)', color: '#4ade80', borderRadius: 6, fontSize: 12, fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(74,222,128,0.2)' }}>📞 Call</a>
                      <a href={`https://wa.me/${ride.driverPhone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: 'center', padding: '6px 0', background: 'rgba(37,211,102,0.1)', color: '#25d366', borderRadius: 6, fontSize: 12, fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(37,211,102,0.2)' }}>💬 WhatsApp</a>
                    </div>
                  )}
                </div>
                <button onClick={() => handleLeave(ride._id)} style={{ width: '100%', background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: 12, padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Leave This Ride</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'post' && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 14, padding: isMobile ? 18 : 28 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--cream)', marginBottom: 20 }}>Post a Ride</div>
              <form onSubmit={handleCreate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  {[{ label: 'From', key: 'from', placeholder: 'Campus Main Gate' }, { label: 'To', key: 'to', placeholder: 'Bastos' }].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input type="text" required value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} style={inputStyle} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Departure Time</label>
                    <input type="time" required value={form.departureTime} onChange={e => setForm({ ...form, departureTime: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Available Seats</label>
                    <input type="number" min="1" max="8" required value={form.availableSeats} onChange={e => setForm({ ...form, availableSeats: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Price / Seat (FCFA)</label>
                    <input type="number" min="0" required value={form.pricePerSeat} onChange={e => setForm({ ...form, pricePerSeat: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Notes (optional)</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Any additional info..." style={{ ...inputStyle, resize: 'none' }} />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--gold)', color: 'var(--navy)', border: 'none', padding: 11, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  {loading ? 'Posting...' : 'Post Ride'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'my' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myRides.length === 0 ? (
              <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--muted)' }}>No rides posted yet.</div>
            ) : myRides.map(ride => (
              <div key={ride._id} style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--cream)', marginBottom: 4 }}>📍 {ride.from} → {ride.to}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.8 }}>
                      <div>📅 {new Date(ride.date).toDateString()} at {ride.departureTime}</div>
                      <div>💺 {ride.passengers?.length || 0} / {ride.availableSeats} seats · 💰 {ride.pricePerSeat?.toLocaleString()} FCFA</div>
                      {ride.notes && <div style={{ fontStyle: 'italic' }}>"{ride.notes}"</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: ride.status === 'open' ? 'rgba(74,222,128,0.1)' : ride.status === 'full' ? 'rgba(201,168,76,0.1)' : 'var(--card-bg)', color: ride.status === 'open' ? '#4ade80' : ride.status === 'full' ? 'var(--gold-light)' : 'var(--muted)' }}>{ride.status}</span>
                    {(ride.status === 'open' || ride.status === 'full') && (
                      <button onClick={() => handleCancel(ride._id)} style={{ background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: 11, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel Ride</button>
                    )}
                  </div>
                </div>

                {ride.passengers?.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Passengers ({ride.passengers.length})</div>
                      <button onClick={() => setExpandedPassengers(expandedPassengers === ride._id ? null : ride._id)} style={{ background: 'none', border: 'none', color: 'var(--gold-light)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                        {expandedPassengers === ride._id ? 'Hide' : 'View All'}
                      </button>
                    </div>
                    {expandedPassengers === ride._id && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {ride.passengers.map((p, i) => (
                          <div key={i} style={{ background: 'var(--navy)', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 500 }}>👤 {p.userName}</div>
                              {p.userPhone && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.userPhone}</div>}
                            </div>
                            {p.userPhone && (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <a href={`tel:${p.userPhone}`} style={{ padding: '5px 10px', background: 'rgba(74,222,128,0.1)', color: '#4ade80', borderRadius: 6, fontSize: 11, textDecoration: 'none', border: '1px solid rgba(74,222,128,0.2)' }}>📞</a>
                                <a href={`https://wa.me/${p.userPhone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ padding: '5px 10px', background: 'rgba(37,211,102,0.1)', color: '#25d366', borderRadius: 6, fontSize: 11, textDecoration: 'none', border: '1px solid rgba(37,211,102,0.2)' }}>💬</a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}