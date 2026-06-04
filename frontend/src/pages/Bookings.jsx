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

const statusColor = (s) => ({
  confirmed: { bg: 'rgba(74,222,128,0.1)', color: '#4ade80' },
  pending: { bg: 'rgba(201,168,76,0.1)', color: 'var(--gold-light)' },
  cancelled: { bg: 'rgba(248,113,113,0.1)', color: '#f87171' },
  rejected: { bg: 'rgba(248,113,113,0.1)', color: '#f87171' },
}[s] || { bg: 'var(--card-bg)', color: 'var(--muted)' });

const emptyFacility = { name: '', type: 'lab', capacity: '', location: '', description: '', isAvailable: true };

export default function Bookings() {
  const isMobile = useIsMobile();
  const isAdmin = localStorage.getItem('userRole') === 'admin';

  const [facilities, setFacilities] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(isAdmin ? 'admin' : 'book');
  const [filter, setFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('pending');

  // Facility form state
  const [showFacilityForm, setShowFacilityForm] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [facilityForm, setFacilityForm] = useState(emptyFacility);
  const [facilityLoading, setFacilityLoading] = useState(false);

  const [form, setForm] = useState({
    facilityId: '', date: '', startTime: '',
    duration: 1, numberOfPeople: 1, purpose: ''
  });

  useEffect(() => {
    fetchFacilities();
    if (isAdmin) fetchAllBookings();
    else fetchMyBookings();
  }, []);

  const fetchFacilities = async () => {
    try { const res = await api.get('/bookings/facilities'); setFacilities(res.data.facilities); }
    catch (err) { console.error(err); }
  };

  const fetchMyBookings = async () => {
    try { const res = await api.get('/bookings/my'); setMyBookings(res.data.bookings); }
    catch (err) { console.error(err); }
  };

  const fetchAllBookings = async () => {
    try { const res = await api.get('/bookings/all'); setAllBookings(res.data.bookings); }
    catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/bookings', form);
      toast.success('Booking request submitted! Awaiting admin approval.');
      fetchMyBookings();
      setForm({ facilityId: '', date: '', startTime: '', duration: 1, numberOfPeople: 1, purpose: '' });
      setActiveTab('my');
    } catch (err) { toast.error(err.response?.data?.message || 'Booking failed.'); }
    finally { setLoading(false); }
  };

  const cancelBooking = async (id) => {
    try { await api.delete(`/bookings/${id}`); toast.success('Booking cancelled.'); fetchMyBookings(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel.'); }
  };

  const confirmBooking = async (id) => {
    try { await api.patch(`/bookings/${id}/confirm`); toast.success('Booking confirmed!'); fetchAllBookings(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const rejectBooking = async (id) => {
    try { await api.patch(`/bookings/${id}/reject`); toast.success('Booking rejected.'); fetchAllBookings(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const handleFacilitySubmit = async (e) => {
    e.preventDefault(); setFacilityLoading(true);
    try {
      if (editingFacility) {
        await api.patch(`/bookings/facilities/${editingFacility._id}`, facilityForm);
        toast.success('Facility updated!');
      } else {
        await api.post('/bookings/facilities', facilityForm);
        toast.success('Facility added!');
      }
      fetchFacilities();
      setShowFacilityForm(false);
      setEditingFacility(null);
      setFacilityForm(emptyFacility);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setFacilityLoading(false); }
  };

  const handleEditFacility = (facility) => {
    setEditingFacility(facility);
    setFacilityForm({
      name: facility.name,
      type: facility.type,
      capacity: facility.capacity,
      location: facility.location,
      description: facility.description || '',
      isAvailable: facility.isAvailable,
    });
    setShowFacilityForm(true);
  };

  const handleDeleteFacility = async (id) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) return;
    try { await api.delete(`/bookings/facilities/${id}`); toast.success('Facility deleted.'); fetchFacilities(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const filteredBookings = myBookings.filter(b => filter === 'all' || b.status === filter);
  const filteredAdminBookings = allBookings.filter(b => adminFilter === 'all' || b.status === adminFilter);

  const studentTabs = [
    { key: 'book', label: 'New Booking' },
    { key: 'my', label: `My Bookings${myBookings.length > 0 ? ` (${myBookings.length})` : ''}` },
    { key: 'facilities', label: 'All Facilities' },
  ];

  const adminTabs = [
    { key: 'admin', label: `Pending${allBookings.filter(b => b.status === 'pending').length > 0 ? ` (${allBookings.filter(b => b.status === 'pending').length})` : ''}` },
    { key: 'allbookings', label: 'All Bookings' },
    { key: 'facilities', label: 'Manage Facilities' },
  ];

  const tabs = isAdmin ? adminTabs : studentTabs;

  return (
    <div>
      <PageHero
        icon="📅"
        title={isAdmin ? 'Booking Management' : 'Facility Booking'}
        subtitle={isAdmin ? 'Review booking requests and manage campus facilities.' : 'Reserve computer labs and lecture halls — fast, easy, conflict-free.'}
        color="#60a5fa"
        action={isAdmin ? () => { setShowFacilityForm(true); setEditingFacility(null); setFacilityForm(emptyFacility); setActiveTab('facilities'); } : () => setActiveTab('book')}
        actionLabel={isAdmin ? '+ Add Facility' : '+ New Booking'}
      />

      <div style={{ padding: isMobile ? '12px' : '18px 28px', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--navy-3)', borderRadius: 8, padding: 3, width: 'fit-content' }}>
          {tabs.map(({ key, label }) => (
            <button key={key} onClick={() => { setActiveTab(key); setShowFacilityForm(false); }} style={{
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

        {/* ADMIN PENDING */}
        {isAdmin && activeTab === 'admin' && (
          <div>
            <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 10, fontSize: 12, color: '#60a5fa' }}>
              👋 Logged in as <strong>Admin</strong>. Review and approve or reject student booking requests below.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {allBookings.filter(b => b.status === 'pending').length === 0 ? (
                <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
                  No pending booking requests 🎉
                </div>
              ) : allBookings.filter(b => b.status === 'pending').map(b => (
                <div key={b._id} style={{ background: 'var(--navy-3)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--cream)', marginBottom: 4 }}>
                        {b.facilityId?.name || 'Facility'}
                        <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 8 }}>{b.facilityId?.location}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.8 }}>
                        <div>👤 Requested by: <strong style={{ color: 'var(--cream)' }}>{b.userName}</strong></div>
                        <div>📅 {new Date(b.date).toDateString()} · ⏰ {b.startTime} · ⏱ {b.duration}hr(s)</div>
                        <div>👥 {b.numberOfPeople} people</div>
                        <div>📝 {b.purpose}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: 'rgba(201,168,76,0.1)', color: 'var(--gold-light)' }}>pending</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => confirmBooking(b._id)} style={{ flex: 1, background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)', padding: '9px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>✓ Confirm</button>
                    <button onClick={() => rejectBooking(b._id)} style={{ flex: 1, background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '9px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>✕ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADMIN ALL BOOKINGS */}
        {isAdmin && activeTab === 'allbookings' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {['all', 'pending', 'confirmed', 'rejected', 'cancelled'].map(f => (
                <button key={f} onClick={() => setAdminFilter(f)} style={{
                  padding: '5px 14px', borderRadius: 20, border: '1px solid var(--border)', cursor: 'pointer',
                  fontSize: 11, fontFamily: 'var(--font-body)', fontWeight: adminFilter === f ? 500 : 400,
                  background: adminFilter === f ? 'var(--gold-dim)' : 'var(--navy-3)',
                  color: adminFilter === f ? 'var(--gold-light)' : 'var(--muted)'
                }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredAdminBookings.length === 0 ? (
                <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
                  No {adminFilter === 'all' ? '' : adminFilter} bookings found.
                </div>
              ) : filteredAdminBookings.map(b => {
                const sc = statusColor(b.status);
                return (
                  <div key={b._id} style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: sc.color }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{b.facilityId?.name || 'Facility'} <span style={{ fontSize: 11, color: 'var(--muted)' }}>· {b.userName}</span></div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>📅 {new Date(b.date).toDateString()} · ⏰ {b.startTime} · 👥 {b.numberOfPeople} people</div>
                    </div>
                    <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}>{b.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FACILITIES TAB */}
        {activeTab === 'facilities' && (
          <div>
            {/* ADMIN FACILITY FORM */}
            {isAdmin && showFacilityForm && (
              <div style={{ background: 'var(--navy-3)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 14, padding: isMobile ? 18 : 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--cream)' }}>
                    {editingFacility ? 'Edit Facility' : 'Add New Facility'}
                  </div>
                  <button onClick={() => { setShowFacilityForm(false); setEditingFacility(null); setFacilityForm(emptyFacility); }} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer' }}>✕</button>
                </div>
                <form onSubmit={handleFacilitySubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Facility Name</label>
                      <input type="text" required value={facilityForm.name} onChange={e => setFacilityForm({ ...facilityForm, name: e.target.value })} placeholder="e.g. Computer Lab D" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Type</label>
                      <select value={facilityForm.type} onChange={e => setFacilityForm({ ...facilityForm, type: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="lab">Computer Lab</option>
                        <option value="lecture_hall">Lecture Hall</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Capacity</label>
                      <input type="number" min="1" required value={facilityForm.capacity} onChange={e => setFacilityForm({ ...facilityForm, capacity: e.target.value })} placeholder="e.g. 30" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Location</label>
                      <input type="text" required value={facilityForm.location} onChange={e => setFacilityForm({ ...facilityForm, location: e.target.value })} placeholder="e.g. Block C, Floor 2" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Description</label>
                    <textarea value={facilityForm.description} onChange={e => setFacilityForm({ ...facilityForm, description: e.target.value })} rows={2} placeholder="Brief description of the facility..." style={{ ...inputStyle, resize: 'none' }} />
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input type="checkbox" checked={facilityForm.isAvailable} onChange={e => setFacilityForm({ ...facilityForm, isAvailable: e.target.checked })} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                      <span style={{ fontSize: 13, color: 'var(--cream)' }}>Available for booking</span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" disabled={facilityLoading} style={{ flex: 1, background: 'var(--gold)', color: 'var(--navy)', border: 'none', padding: 11, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                      {facilityLoading ? 'Saving...' : editingFacility ? 'Save Changes' : 'Add Facility'}
                    </button>
                    <button type="button" onClick={() => { setShowFacilityForm(false); setEditingFacility(null); setFacilityForm(emptyFacility); }} style={{ padding: '11px 20px', background: 'var(--navy)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ADMIN ADD BUTTON */}
            {isAdmin && !showFacilityForm && (
              <div style={{ marginBottom: 16 }}>
                <button onClick={() => { setShowFacilityForm(true); setEditingFacility(null); setFacilityForm(emptyFacility); }} style={{ background: 'var(--gold)', color: 'var(--navy)', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  + Add New Facility
                </button>
              </div>
            )}

            {/* FACILITIES GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 14 }}>
              {facilities.length === 0 ? (
                <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--muted)', gridColumn: 'span 2' }}>
                  No facilities available. {isAdmin && 'Add one above!'}
                </div>
              ) : facilities.map(f => (
                <div key={f._id} style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--cream)' }}>{f.name}</div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                      <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: f.type === 'lab' ? 'rgba(96,165,250,0.1)' : 'rgba(167,139,250,0.1)', color: f.type === 'lab' ? '#60a5fa' : '#a78bfa' }}>
                        {f.type === 'lab' ? 'Computer Lab' : 'Lecture Hall'}
                      </span>
                      <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: f.isAvailable ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: f.isAvailable ? '#4ade80' : '#f87171' }}>
                        {f.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 12 }}>
                    <div>📍 {f.location}</div>
                    <div>👥 Capacity: {f.capacity} people</div>
                    {f.description && <div>ℹ️ {f.description}</div>}
                  </div>

                  {isAdmin ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEditFacility(f)} style={{ flex: 1, background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)', padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDeleteFacility(f._id)} style={{ flex: 1, background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                        🗑 Delete
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setForm({ ...form, facilityId: f._id }); setActiveTab('book'); }} style={{ width: '100%', background: 'var(--gold-dim)', color: 'var(--gold-light)', border: '1px solid rgba(201,168,76,0.2)', padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                      Book This Facility
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STUDENT NEW BOOKING */}
        {!isAdmin && activeTab === 'book' && (
          <div style={{ maxWidth: 540 }}>
            <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, fontSize: 12, color: 'var(--gold-light)' }}>
              💡 Booking requests require admin approval. Check status in <strong>My Bookings</strong>.
            </div>
            <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 14, padding: isMobile ? 18 : 28 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--cream)', marginBottom: 20 }}>Reserve a Space</div>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Facility</label>
                  <select required value={form.facilityId} onChange={e => setForm({ ...form, facilityId: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select a facility</option>
                    {facilities.filter(f => f.isAvailable).map(f => (
                      <option key={f._id} value={f._id}>{f.name} — {f.location} (Cap: {f.capacity})</option>
                    ))}
                  </select>
                </div>

                {form.facilityId && (() => {
                  const f = facilities.find(x => x._id === form.facilityId);
                  return f ? (
                    <div style={{ background: 'var(--navy)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, border: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.8 }}>
                      <div>🏛️ {f.type === 'lab' ? 'Computer Lab' : 'Lecture Hall'}</div>
                      <div>📍 {f.location}</div>
                      <div>👥 Capacity: {f.capacity} people</div>
                      {f.description && <div>ℹ️ {f.description}</div>}
                    </div>
                  ) : null;
                })()}

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input type="date" required value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Start Time</label>
                    <input type="time" required value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>Duration (hours)</label>
                    <input type="number" min="1" max="8" required value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Number of People</label>
                    <input type="number" min="1" required value={form.numberOfPeople} onChange={e => setForm({ ...form, numberOfPeople: e.target.value })} style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Purpose</label>
                  <textarea required value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} rows={3} placeholder="Describe the purpose of your booking..." style={{ ...inputStyle, resize: 'none' }} />
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--gold)', color: 'var(--navy)', border: 'none', padding: 11, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  {loading ? 'Submitting...' : 'Submit Booking Request'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STUDENT MY BOOKINGS */}
        {!isAdmin && activeTab === 'my' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {['all', 'pending', 'confirmed', 'rejected', 'cancelled'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '5px 14px', borderRadius: 20, border: '1px solid var(--border)', cursor: 'pointer',
                  fontSize: 11, fontFamily: 'var(--font-body)', fontWeight: filter === f ? 500 : 400,
                  background: filter === f ? 'var(--gold-dim)' : 'var(--navy-3)',
                  color: filter === f ? 'var(--gold-light)' : 'var(--muted)'
                }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredBookings.length === 0 ? (
                <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
                  No {filter === 'all' ? '' : filter} bookings found.
                </div>
              ) : filteredBookings.map(b => {
                const sc = statusColor(b.status);
                return (
                  <div key={b._id} style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: isMobile ? 14 : '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: sc.color }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{b.facilityId?.name || 'Facility'}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.7 }}>
                        <div>📅 {new Date(b.date).toDateString()} · ⏰ {b.startTime} · ⏱ {b.duration}hr(s)</div>
                        <div>👥 {b.numberOfPeople} people · 📝 {b.purpose}</div>
                      </div>
                      {b.status === 'pending' && <div style={{ fontSize: 11, color: 'var(--gold-light)', marginTop: 4 }}>⏳ Awaiting admin approval</div>}
                      {b.status === 'rejected' && <div style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>❌ Request was rejected by admin</div>}
                      {b.status === 'confirmed' && <div style={{ fontSize: 11, color: '#4ade80', marginTop: 4 }}>✅ Booking confirmed by admin</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, fontWeight: 500, background: sc.bg, color: sc.color }}>{b.status}</span>
                      {b.status === 'pending' && (
                        <button onClick={() => cancelBooking(b._id)} style={{ background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: 11, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}