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

export default function LostFound() {
  const isMobile = useIsMobile();
  const [reports, setReports] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: 'lost', title: '', description: '', category: 'electronics', location: '', date: '' });

  const userId = localStorage.getItem('userId');

  useEffect(() => { fetchReports(); fetchMyReports(); }, []);

  const fetchReports = async () => {
    try { const res = await api.get('/lost-found'); setReports(res.data.reports); }
    catch (err) { console.error(err); }
  };

  const fetchMyReports = async () => {
    try { const res = await api.get('/lost-found/my'); setMyReports(res.data.reports); }
    catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/lost-found', form);
      toast.success('Report submitted!');
      fetchReports(); fetchMyReports(); setActiveTab('my');
      setForm({ type: 'lost', title: '', description: '', category: 'electronics', location: '', date: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setLoading(false); }
  };

  const handleClaim = async (id) => {
    try { await api.patch(`/lost-found/${id}/claim`); toast.success('Item claimed!'); fetchReports(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const handleResolve = async (id) => {
    try { await api.patch(`/lost-found/${id}/resolve`); toast.success('Marked as resolved!'); fetchMyReports(); fetchReports(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/lost-found/${id}`); toast.success('Report deleted.'); fetchMyReports(); fetchReports(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const filteredReports = reports.filter(r => typeFilter === 'all' || r.type === typeFilter);

  const tabs = [
    { key: 'browse', label: 'Browse Reports' },
    { key: 'my', label: `My Reports${myReports.length > 0 ? ` (${myReports.length})` : ''}` },
    { key: 'report', label: 'Submit Report' },
  ];

  return (
    <div>
      <PageHero icon="🔍" title="Lost & Found" subtitle="Report lost items or claim what you've found. Reuniting the campus community." color="#a78bfa" action={() => setActiveTab('report')} actionLabel="+ Submit Report" />

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
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {['all', 'lost', 'found'].map(f => (
                <button key={f} onClick={() => setTypeFilter(f)} style={{
                  padding: '5px 14px', borderRadius: 20, border: '1px solid var(--border)', cursor: 'pointer',
                  fontSize: 11, fontFamily: 'var(--font-body)', fontWeight: typeFilter === f ? 500 : 400,
                  background: typeFilter === f ? (f === 'lost' ? 'rgba(248,113,113,0.1)' : f === 'found' ? 'rgba(74,222,128,0.1)' : 'var(--gold-dim)') : 'var(--navy-3)',
                  color: typeFilter === f ? (f === 'lost' ? '#f87171' : f === 'found' ? '#4ade80' : 'var(--gold-light)') : 'var(--muted)'
                }}>{f === 'all' ? 'All' : f === 'lost' ? '😢 Lost' : '😊 Found'}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 14 }}>
              {filteredReports.length === 0 ? (
                <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--muted)', gridColumn: 'span 2' }}>
                  No {typeFilter === 'all' ? '' : typeFilter} reports found.
                </div>
              ) : filteredReports.map(r => (
                <div key={r._id} style={{ background: 'var(--navy-3)', border: `1px solid ${r.type === 'lost' ? 'rgba(248,113,113,0.15)' : 'rgba(74,222,128,0.15)'}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--cream)' }}>{r.title}</div>
                    <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, flexShrink: 0, marginLeft: 8, background: r.type === 'lost' ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)', color: r.type === 'lost' ? '#f87171' : '#4ade80' }}>{r.type === 'lost' ? '😢 Lost' : '😊 Found'}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.6 }}>{r.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.8 }}>
                    <div>🏷️ {r.category}</div>
                    <div>📍 {r.location}</div>
                    <div>📅 {new Date(r.date).toDateString()}</div>
                    <div>👤 {r.reporterName}</div>
                  </div>
                  {r.status === 'open' && r.type === 'found' && r.reporterId !== userId && (
                    <button onClick={() => handleClaim(r._id)} style={{ width: '100%', marginTop: 12, background: 'var(--gold-dim)', color: 'var(--gold-light)', border: '1px solid rgba(201,168,76,0.2)', padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Claim Item</button>
                  )}
                  {r.status !== 'open' && (
                    <span style={{ display: 'inline-block', marginTop: 10, fontSize: 10, padding: '3px 8px', borderRadius: 20, background: 'var(--card-bg)', color: 'var(--muted)' }}>{r.status}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'my' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myReports.length === 0 ? (
              <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--muted)' }}>You haven't submitted any reports yet.</div>
            ) : myReports.map(r => (
              <div key={r._id} style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--cream)', marginBottom: 4 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.8 }}>
                      <div>🏷️ {r.category} · 📍 {r.location}</div>
                      <div>📅 {new Date(r.date).toDateString()}</div>
                      {r.expiresAt && <div>⏳ Expires: {new Date(r.expiresAt).toDateString()}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: r.type === 'lost' ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)', color: r.type === 'lost' ? '#f87171' : '#4ade80' }}>{r.type}</span>
                    <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: r.status === 'open' ? 'rgba(96,165,250,0.1)' : 'var(--card-bg)', color: r.status === 'open' ? '#60a5fa' : 'var(--muted)' }}>{r.status}</span>
                  </div>
                </div>
                {r.status === 'open' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => handleResolve(r._id)} style={{ flex: 1, background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)', padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>✓ Mark Resolved</button>
                    <button onClick={() => handleDelete(r._id)} style={{ flex: 1, background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>🗑 Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'report' && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 14, padding: isMobile ? 18 : 28 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--cream)', marginBottom: 20 }}>Submit a Report</div>
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Report Type</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[{ val: 'lost', label: 'I Lost Something', emoji: '😢' }, { val: 'found', label: 'I Found Something', emoji: '😊' }].map(({ val, label, emoji }) => (
                      <button key={val} type="button" onClick={() => setForm({ ...form, type: val })} style={{ flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer', fontSize: isMobile ? 11 : 12, fontFamily: 'var(--font-body)', background: form.type === val ? 'var(--gold-dim)' : 'var(--navy)', color: form.type === val ? 'var(--gold-light)' : 'var(--muted)', border: form.type === val ? '1px solid rgba(201,168,76,0.3)' : '1px solid var(--border)' }}>{emoji} {label}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Title</label>
                  <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Black laptop bag" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Description</label>
                  <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe the item in detail..." style={{ ...inputStyle, resize: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {['electronics', 'clothing', 'documents', 'accessories', 'books', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Location</label>
                  <input type="text" required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Where was it lost/found?" style={inputStyle} />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--gold)', color: 'var(--navy)', border: 'none', padding: 11, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}