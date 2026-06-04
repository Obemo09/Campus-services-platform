import useIsMobile from '../hooks/useIsMobile';

export default function Footer() {
  const isMobile = useIsMobile();
  if (isMobile) return null;
  return (
    <div style={{
      borderTop: '1px solid var(--border)',
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--navy-2)',
    }}>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
        © 2026 Campus Services Platform · ICT University Cameroon
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
        Built by <span style={{ color: 'var(--gold-light)' }}>Obemo</span> & <span style={{ color: 'var(--gold-light)' }}>Yoyo</span>
      </div>
    </div>
  );
}