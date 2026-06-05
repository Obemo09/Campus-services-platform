import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 8.5L9 2l8 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9v6h10V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ), path: '/dashboard' },
  { label: 'Facility Booking', icon: '📅', path: '/bookings' },
  { label: 'Events', icon: '🎉', path: '/events' },
  { label: 'Marketplace', icon: '🛒', path: '/marketplace' },
  { label: 'Lost & Found', icon: '🔍', path: '/lost-found' },
  { label: 'Carpooling', icon: '🚗', path: '/carpooling' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const isAdmin = localStorage.getItem('userRole') === 'admin';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: 'var(--sidebar-w)',
      background: 'var(--navy-2)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: 'var(--gold)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
          }}>🎓</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--cream)' }}>Campus</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.04em' }}>Your campus, simplified.</div>
          </div>
        </div>
      </div>

      {/* Admin badge */}
      {isAdmin && (
        <div style={{ margin: '12px 12px 0', padding: '6px 10px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, fontSize: 11, color: 'var(--gold-light)', textAlign: 'center' }}>
          👑 Admin Account
        </div>
      )}

      {/* Nav */}
      <div style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
        {navItems.map(({ label, icon, path }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 8, marginBottom: 2,
                fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                background: active ? 'var(--gold-dim)' : 'transparent',
                color: active ? 'var(--gold-light)' : 'var(--muted)',
                fontWeight: active ? 500 : 400,
              }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                {label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* User + Logout */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        {/* User info */}
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gold), #8b5e1a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, color: 'var(--navy)', flexShrink: 0
          }}>{initials}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--cream)' }}>{user?.name}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{isAdmin ? 'Administrator' : 'Student'}</div>
          </div>
        </div>

        {/* Logout button */}
        <div style={{ padding: '0 12px 16px' }}>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '9px 0', borderRadius: 8, cursor: 'pointer',
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
            color: '#f87171', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)',
            transition: 'all 0.15s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}