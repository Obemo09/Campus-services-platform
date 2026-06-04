import useIsMobile from '../hooks/useIsMobile';

export default function PageHero({ icon, title, subtitle, color, action, actionLabel }) {
  const isMobile = useIsMobile();
  return (
    <div style={{
      padding: isMobile ? '16px' : '24px 28px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--navy-2)',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: -60, right: -60, width: 200, height: 200,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? 12 : 0, position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: isMobile ? 42 : 52, height: isMobile ? 42 : 52,
            borderRadius: 14, background: `${color}12`,
            border: `1px solid ${color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isMobile ? 20 : 26, flexShrink: 0
          }}>{icon}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 18 : 22, color: 'var(--cream)', marginBottom: 3 }}>{title}</div>
            {!isMobile && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{subtitle}</div>}
          </div>
        </div>
        {action && (
          <button onClick={action} style={{
            background: color, color: '#fff', border: 'none',
            padding: '9px 18px', borderRadius: 9, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            width: isMobile ? '100%' : 'auto'
          }}>{actionLabel}</button>
        )}
      </div>
    </div>
  );
}