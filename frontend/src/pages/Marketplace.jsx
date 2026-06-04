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

const conditionStyle = {
  new: { bg: 'rgba(74,222,128,0.1)', color: '#4ade80' },
  like_new: { bg: 'rgba(96,165,250,0.1)', color: '#60a5fa' },
  good: { bg: 'rgba(201,168,76,0.1)', color: 'var(--gold-light)' },
  fair: { bg: 'rgba(251,146,60,0.1)', color: '#fb923c' },
};

export default function Marketplace() {
  const isMobile = useIsMobile();
  const [items, setItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [loading, setLoading] = useState(false);
  const [contactItem, setContactItem] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'textbooks', price: '', condition: 'good' });

  useEffect(() => { fetchItems(); fetchMyItems(); }, []);

  const fetchItems = async () => {
    try { const res = await api.get('/marketplace'); setItems(res.data.items); }
    catch (err) { console.error(err); }
  };

  const fetchMyItems = async () => {
    try { const res = await api.get('/marketplace/my'); setMyItems(res.data.items); }
    catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/marketplace', form);
      toast.success('Item listed!');
      fetchItems(); fetchMyItems(); setActiveTab('browse');
      setForm({ title: '', description: '', category: 'textbooks', price: '', condition: 'good' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setLoading(false); }
  };

  const markAsSold = async (id) => {
    try { await api.patch(`/marketplace/${id}/sold`); toast.success('Marked as sold!'); fetchMyItems(); }
    catch { toast.error('Failed.'); }
  };

  const tabs = [
    { key: 'browse', label: 'Browse Items' },
    { key: 'sell', label: 'Sell an Item' },
    { key: 'my', label: `My Listings${myItems.length > 0 ? ` (${myItems.length})` : ''}` },
  ];

  return (
    <div>
      <PageHero icon="🛒" title="Student Marketplace" subtitle="Buy and sell textbooks, electronics and more within your campus community." color="#c9a84c" action={() => setActiveTab('sell')} actionLabel="+ Sell an Item" />

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
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 14, alignItems: 'start' }}>
            {items.length === 0 ? (
              <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--muted)', gridColumn: 'span 3' }}>
                No items listed yet. Be the first to sell something!
              </div>
            ) : items.map(item => {
              const cond = conditionStyle[item.condition] || conditionStyle.good;
              return (
                <div key={item._id} style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--cream)' }}>{item.title}</div>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: cond.bg, color: cond.color, flexShrink: 0, marginLeft: 8 }}>{item.condition}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.5 }}>{item.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>🏷️ {item.category} · 👤 {item.sellerName}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--gold-light)', marginTop: 8, marginBottom: 12 }}>{item.price?.toLocaleString()} FCFA</div>
                  <button onClick={() => setContactItem(contactItem === item._id ? null : item._id)} style={{ width: '100%', background: 'var(--gold-dim)', color: 'var(--gold-light)', border: '1px solid rgba(201,168,76,0.2)', padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    {contactItem === item._id ? 'Hide Contact' : '📞 I\'m Interested'}
                  </button>
                  {contactItem === item._id && (
                    <div style={{ marginTop: 10, padding: '12px 14px', background: 'var(--navy)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Contact seller:</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a href={`tel:${item.sellerPhone}`} style={{ flex: 1, textAlign: 'center', padding: '7px 0', background: 'rgba(74,222,128,0.1)', color: '#4ade80', borderRadius: 6, fontSize: 12, fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(74,222,128,0.2)' }}>📞 Call</a>
                        <a href={`https://wa.me/${item.sellerPhone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: 'center', padding: '7px 0', background: 'rgba(37,211,102,0.1)', color: '#25d366', borderRadius: 6, fontSize: 12, fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(37,211,102,0.2)' }}>💬 WhatsApp</a>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--cream)', textAlign: 'center', marginTop: 8 }}>{item.sellerPhone}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'sell' && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 14, padding: isMobile ? 18 : 28 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--cream)', marginBottom: 20 }}>List an Item for Sale</div>
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Item Title</label>
                  <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Clean Architecture Book" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Description</label>
                  <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe your item..." style={{ ...inputStyle, resize: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {['textbooks', 'electronics', 'clothing', 'furniture', 'stationery', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Condition</label>
                    <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {['new', 'like_new', 'good', 'fair'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Price (FCFA)</label>
                  <input type="number" min="0" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 5000" style={inputStyle} />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--gold)', color: 'var(--navy)', border: 'none', padding: 11, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  {loading ? 'Listing...' : 'List Item'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'my' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myItems.length === 0 ? (
              <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--muted)' }}>No listings yet. Start selling!</div>
            ) : myItems.map(item => (
              <div key={item._id} style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: 16, flexDirection: isMobile ? 'column' : 'row' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.category} · {item.condition}</div>
                  <div style={{ fontSize: 13, color: 'var(--gold-light)', fontWeight: 600, marginTop: 4 }}>{item.price?.toLocaleString()} FCFA</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                  <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: item.status === 'available' ? 'rgba(74,222,128,0.1)' : 'var(--card-bg)', color: item.status === 'available' ? '#4ade80' : 'var(--muted)' }}>{item.status}</span>
                  {item.status === 'available' && (
                    <button onClick={() => markAsSold(item._id)} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 11, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Mark as Sold</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}