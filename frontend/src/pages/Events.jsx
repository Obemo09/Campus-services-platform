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

const categoryColors = {
  academic: { bg: 'rgba(96,165,250,0.1)', color: '#60a5fa' },
  sports: { bg: 'rgba(74,222,128,0.1)', color: '#4ade80' },
  cultural: { bg: 'rgba(201,168,76,0.1)', color: 'var(--gold-light)' },
  social: { bg: 'rgba(244,114,182,0.1)', color: '#f472b6' },
  career: { bg: 'rgba(167,139,250,0.1)', color: '#a78bfa' },
};

export default function Events() {
  const isMobile = useIsMobile();
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'academic', location: '', date: '', startTime: '', endTime: '', capacity: 50 });

  const userId = localStorage.getItem('userId');

  useEffect(() => { fetchEvents(); fetchMyEvents(); }, []);

  const fetchEvents = async () => {
    try { const res = await api.get('/events'); setEvents(res.data.events); }
    catch (err) { console.error(err); }
  };

  const fetchMyEvents = async () => {
    try { const res = await api.get('/events/my'); setMyEvents(res.data.events); }
    catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/events', form);
      toast.success('Event created!');
      fetchEvents(); fetchMyEvents(); setActiveTab('browse');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setLoading(false); }
  };

  const handleRsvp = async (id) => {
    try { await api.post(`/events/${id}/rsvp`); toast.success('RSVP successful!'); fetchEvents(); }
    catch (err) { toast.error(err.response?.data?.message || 'RSVP failed.'); }
  };

  const handleCancelRsvp = async (id) => {
    try { await api.delete(`/events/${id}/rsvp`); toast.success('RSVP cancelled.'); fetchEvents(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const handleCancelEvent = async (id) => {
    try { await api.delete(`/events/${id}`); toast.success('Event cancelled.'); fetchEvents(); fetchMyEvents(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const isRsvpd = (ev) => ev.attendees?.some(a => a.userId === userId);
  const isOrganizer = (ev) => ev.organizerId === userId;

  const tabs = [
    { key: 'browse', label: 'Browse Events' },
    { key: 'my', label: `My Events${myEvents.length > 0 ? ` (${myEvents.length})` : ''}` },
    { key: 'create', label: 'Create Event' },
  ];

  return (
    <div>
      <PageHero icon="🎉" title="Campus Events" subtitle="Discover seminars, sports, cultural nights and more happening around you." color="#f472b6" action={() => setActiveTab('create')} actionLabel="+ Create Event" />

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
            {events.length === 0 ? (
              <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--muted)', gridColumn: 'span 2' }}>
                No upcoming events. Be the first to create one!
              </div>
            ) : events.map(ev => {
              const cat = categoryColors[ev.category] || categoryColors.academic;
              const rsvpd = isRsvpd(ev);
              const organizer = isOrganizer(ev);
              return (
                <div key={ev._id} style={{ background: 'var(--navy-3)', border: `1px solid ${rsvpd ? 'rgba(201,168,76,0.3)' : 'var(--border)'}`, borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--cream)', flex: 1, marginRight: 10 }}>{ev.title}</div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {rsvpd && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--gold-dim)', color: 'var(--gold-light)' }}>RSVP'd</span>}
                      <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: cat.bg, color: cat.color }}>{ev.category}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{ev.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.8 }}>
                    <div>📍 {ev.location}</div>
                    <div>📅 {new Date(ev.date).toDateString()} · {ev.startTime} – {ev.endTime}</div>
                    <div>👥 {ev.attendees?.length || 0} / {ev.capacity} attending · by {ev.organizerName}</div>
                  </div>
                  {!organizer && (rsvpd ? (
                    <button onClick={() => handleCancelRsvp(ev._id)} style={{ background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel RSVP</button>
                  ) : (
                    <button onClick={() => handleRsvp(ev._id)} disabled={ev.attendees?.length >= ev.capacity} style={{ background: ev.attendees?.length >= ev.capacity ? 'var(--card-bg)' : 'var(--gold-dim)', color: ev.attendees?.length >= ev.capacity ? 'var(--muted)' : 'var(--gold-light)', border: '1px solid rgba(201,168,76,0.2)', padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: ev.attendees?.length >= ev.capacity ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)' }}>
                      {ev.attendees?.length >= ev.capacity ? 'Event Full' : 'RSVP to Event'}
                    </button>
                  ))}
                  {organizer && (
                    <button onClick={() => handleCancelEvent(ev._id)} style={{ background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel Event</button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'my' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myEvents.length === 0 ? (
              <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--muted)' }}>You haven't created any events yet.</div>
            ) : myEvents.map(ev => {
              const cat = categoryColors[ev.category] || categoryColors.academic;
              return (
                <div key={ev._id} style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--cream)', marginBottom: 4 }}>{ev.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.8 }}>
                        <div>📍 {ev.location}</div>
                        <div>📅 {new Date(ev.date).toDateString()} · {ev.startTime} – {ev.endTime}</div>
                        <div>👥 {ev.attendees?.length || 0} / {ev.capacity} attending</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: cat.bg, color: cat.color }}>{ev.category}</span>
                      <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: ev.status === 'upcoming' ? 'rgba(74,222,128,0.1)' : 'var(--card-bg)', color: ev.status === 'upcoming' ? '#4ade80' : 'var(--muted)' }}>{ev.status}</span>
                    </div>
                  </div>
                  {ev.attendees?.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Attendees ({ev.attendees.length})</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {ev.attendees.map((a, i) => (
                          <span key={i} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'var(--navy)', border: '1px solid var(--border)', color: 'var(--cream)' }}>👤 {a.userName}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {ev.status === 'upcoming' && (
                    <button onClick={() => handleCancelEvent(ev._id)} style={{ width: '100%', marginTop: 12, background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel Event</button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'create' && (
          <div style={{ maxWidth: 540 }}>
            <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 14, padding: isMobile ? 18 : 28 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--cream)', marginBottom: 20 }}>Create New Event</div>
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Title</label>
                  <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event title" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Description</label>
                  <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe your event..." style={{ ...inputStyle, resize: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {['academic', 'sports', 'cultural', 'social', 'career'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Capacity</label>
                    <input type="number" min="1" required value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Location</label>
                  <input type="text" required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Event location" style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
                  {[{ label: 'Date', key: 'date', type: 'date' }, { label: 'Start Time', key: 'startTime', type: 'time' }, { label: 'End Time', key: 'endTime', type: 'time' }].map(({ label, key, type }) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input type={type} required value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--gold)', color: 'var(--navy)', border: 'none', padding: 11, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}