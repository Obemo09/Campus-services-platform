import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 8.5L9 2l8 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9v6h10V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ), label: 'Home', path: '/dashboard' },
  { icon: '📅', label: 'Booking', path: '/bookings' },
  { icon: '🎉', label: 'Events', path: '/events' },
  { icon: '🛒', label: 'Market', path: '/marketplace' },
  { icon: '🔍', label: 'Lost', path: '/lost-found' },
  { icon: '🚗', label: 'Rides', path: '/carpooling' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--navy-2)', borderTop: '1px solid var(--border)',
      display: 'flex', zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {navItems.map(({ icon, label, path }) => {
        const active = location.pathname === path;
        return (
          <Link key={path} to={path} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '8px 2px', textDecoration: 'none', gap: 2,
            background: active ? 'var(--gold-dim)' : 'transparent',
            borderTop: active ? '2px solid var(--gold)' : '2px solid transparent',
            transition: 'all 0.15s'
          }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span style={{
              fontSize: 8, fontFamily: 'var(--font-body)',
              color: active ? 'var(--gold-light)' : 'var(--muted)',
              fontWeight: active ? 500 : 400
            }}>{label}</span>
          </Link>
        );
      })}

      {/* Logout button */}
  <button onClick={handleLogout} style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '8px 2px', gap: 2, cursor: 'pointer',
        background: 'transparent', border: 'none',
        borderTop: '2px solid transparent',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span style={{ fontSize: 8, fontFamily: 'var(--font-body)', color: '#f87171', fontWeight: 400 }}>Logout</span>
      </button>
    </div>
  );
}