import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/index.js';
import useIsMobile from '../hooks/useIsMobile';

const services = [
  { label: 'Facility Booking', icon: '📅', path: '/bookings', desc: 'Reserve labs & lecture halls', tagline: 'Book your space in seconds', color: '#60a5fa' },
  { label: 'Campus Events', icon: '🎉', path: '/events', desc: 'Discover what\'s happening', tagline: 'Never miss a moment', color: '#f472b6' },
  { label: 'Marketplace', icon: '🛒', path: '/marketplace', desc: 'Buy & sell within campus', tagline: 'Student deals, real prices', color: '#c9a84c' },
  { label: 'Lost & Found', icon: '🔍', path: '/lost-found', desc: 'Reunite with your belongings', tagline: 'Lost it? We\'ll find it', color: '#a78bfa' },
  { label: 'Carpooling', icon: '🚗', path: '/carpooling', desc: 'Share rides, split costs', tagline: 'Travel together, save more', color: '#4ade80' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetingEmoji = hour < 12 ? '☀️' : hour < 17 ? '⛅' : '🌙';

  const [stats, setStats] = useState([
    { label: 'Active Bookings', value: '—', icon: '📅', accent: '#60a5fa' },
    { label: 'Upcoming Events', value: '—', icon: '🎉', accent: '#f472b6' },
    { label: 'My Listings', value: '—', icon: '🛒', accent: '#c9a84c' },
    { label: 'Available Rides', value: '—', icon: '🚗', accent: '#4ade80' },
  ]);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [bookingsRes, eventsRes, marketplaceRes, ridesRes] = await Promise.allSettled([
        api.get('/bookings/my'),
        api.get('/events'),
        api.get('/marketplace/my'),
        api.get('/carpooling'),
      ]);
      setStats([
        { label: 'Active Bookings', icon: '📅', accent: '#60a5fa', value: bookingsRes.status === 'fulfilled' ? bookingsRes.value.data.bookings.filter(b => b.status === 'confirmed').length : 0 },
        { label: 'Upcoming Events', icon: '🎉', accent: '#f472b6', value: eventsRes.status === 'fulfilled' ? eventsRes.value.data.events.length : 0 },
        { label: 'My Listings', icon: '🛒', accent: '#c9a84c', value: marketplaceRes.status === 'fulfilled' ? marketplaceRes.value.data.items.filter(i => i.status === 'available').length : 0 },
        { label: 'Available Rides', icon: '🚗', accent: '#4ade80', value: ridesRes.status === 'fulfilled' ? ridesRes.value.data.rides.filter(r => r.status === 'open').length : 0 },
      ]);
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      {/* HERO */}
      <div style={{
        padding: isMobile ? '20px 16px' : '28px 28px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--navy-2)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? 14 : 0, position: 'relative' }}>
          <div>
            <div style={{ fontSize: isMobile ? 11 : 13, color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.05em' }}>
              {greetingEmoji} {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 22 : 26, color: 'var(--cream)', marginBottom: 6 }}>
              {greeting}, {user?.name?.split(' ')[0]}!
            </div>
            <div style={{ fontSize: isMobile ? 12 : 13, color: 'var(--muted)' }}>
              Welcome to your campus hub — everything you need, all in one place.
            </div>
          </div>
          <button onClick={() => navigate('/bookings')} style={{
            background: 'var(--gold)', color: 'var(--navy)', border: 'none',
            padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            width: isMobile ? '100%' : 'auto',
            boxShadow: '0 4px 20px rgba(201,168,76,0.25)'
          }}>+ New Booking</button>
        </div>
      </div>

      <div style={{ padding: isMobile ? '16px' : '24px 28px' }}>
        {/* STATS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? 10 : 14, marginBottom: isMobile ? 24 : 32
        }}>
          {stats.map(({ label, value, icon, accent }) => (
            <div key={label} style={{
              background: 'var(--navy-3)', border: '1px solid var(--border)',
              borderRadius: 14, padding: isMobile ? '14px' : '18px 20px',
              position: 'relative', overflow: 'hidden', cursor: 'pointer'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}80, transparent)` }} />
              <div style={{ position: 'absolute', top: 10, right: 10, fontSize: isMobile ? 16 : 20, opacity: 0.2 }}>{icon}</div>
              <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 28 : 34, color: 'var(--cream)', lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* SERVICES */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 16 : 18, color: 'var(--cream)', marginBottom: 4 }}>Campus Services</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Everything your campus life needs, built just for you.</div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
          gap: isMobile ? 10 : 14
        }}>
          {services.map(({ label, icon, path, desc, tagline, color }) => (
            <div key={path} onClick={() => navigate(path)} style={{
              background: `${color}08`, border: `1px solid ${color}20`,
              borderRadius: 14, padding: isMobile ? '16px 12px' : '22px 16px',
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{
                width: isMobile ? 40 : 52, height: isMobile ? 40 : 52, borderRadius: 14,
                background: `${color}15`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', fontSize: isMobile ? 20 : 24
              }}>{icon}</div>
              <div style={{ fontSize: isMobile ? 11 : 13, fontWeight: 600, color: 'var(--cream)', marginBottom: 4 }}>{label}</div>
              {!isMobile && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, lineHeight: 1.4 }}>{desc}</div>}
              <div style={{ fontSize: 10, color, fontWeight: 500 }}>{tagline}</div>
            </div>
          ))}
        </div>

        {/* TIP */}
        <div style={{
          marginTop: 24, background: 'var(--navy-3)', border: '1px solid var(--border)',
          borderRadius: 14, padding: isMobile ? '14px' : '18px 22px',
          display: 'flex', alignItems: 'center', gap: 14
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: 'var(--gold-dim)',
            border: '1px solid rgba(201,168,76,0.2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0
          }}>💡</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--cream)', marginBottom: 2 }}>Pro tip</div>
            <div style={{ fontSize: isMobile ? 11 : 12, color: 'var(--muted)' }}>
              Book facilities at least 24 hours in advance. Check the Marketplace daily — new textbooks and electronics are listed every day!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}