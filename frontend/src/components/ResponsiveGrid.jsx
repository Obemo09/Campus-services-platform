import useIsMobile from '../hooks/useIsMobile';

export default function ResponsiveGrid({ children, cols = 2, mobileCols = 1, gap = 14 }) {
  const isMobile = useIsMobile();
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${isMobile ? mobileCols : cols}, 1fr)`,
      gap
    }}>
      {children}
    </div>
  );
}