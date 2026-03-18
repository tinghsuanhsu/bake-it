// ─── Shared UI primitives ────────────────────────────────────────────────────
'use client';

export const Card = ({ children, style = {}, ...rest }) => (
  <div style={{
    background: '#FFFFFF', borderRadius: 20, border: '1px solid #E0DED8',
    padding: 20, marginBottom: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    ...style,
  }} {...rest}>
    {children}
  </div>
);

export const Lbl = ({ children, style = {} }) => (
  <div style={{
    fontSize: 11, fontWeight: 600, color: '#606c38',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
    ...style,
  }}>
    {children}
  </div>
);

export const SecH = ({ children, style = {} }) => (
  <div style={{ fontSize: 13, fontWeight: 600, color: '#606c38', margin: '20px 0 8px', paddingLeft: 4, ...style }}>
    {children}
  </div>
);

export const Inp = ({ value, onChange, type = 'text', placeholder = '', style = {} }) => (
  <input
    value={value} onChange={onChange} type={type} placeholder={placeholder}
    style={{
      background: 'transparent', border: 'none', borderBottom: '2px solid #E0DED8',
      borderRadius: 0, padding: '6px 2px', fontSize: 15, color: '#283618',
      fontFamily: 'inherit', outline: 'none', width: '100%',
      ...style,
    }}
  />
);

export const Badge = ({ children, color = '#5C5C5C' }) => (
  <span style={{
    background: color + '18', color, fontSize: 11, fontWeight: 600,
    borderRadius: 8, padding: '3px 9px', display: 'inline-block',
  }}>
    {children}
  </span>
);

export const Stat = ({ label, value, highlight, color }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 600, color: '#606c38', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
      {label}
    </div>
    <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: highlight ? '#9E3A3A' : (color || '#FFFFFF') }}>
      {value}
    </div>
  </div>
);

export function Stars({ count, max = 5, color = '#5C5C5C', size = 14 }) {
  return (
    <span>
      {[...Array(max)].map((_, i) => (
        <span key={i} style={{ fontSize: size, color: i < count ? color : '#E0DED8' }}> ★</span>
      ))}
    </span>
  );
}

export function Ring({ progress, size = 130, stroke = 11, color = '#5C5C5C', children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(1, progress)));
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E0DED8" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

// ── DragHandle icon ────────────────────────────────────────────────────────────
export const DragHandle = ({ color = '#BBBBAA', ...props }) => (
  <div style={{ padding: '6px 4px', color, flexShrink: 0, ...props.style }} {...props}>
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
      <rect y="0" width="16" height="2" rx="1"/>
      <rect y="5" width="16" height="2" rx="1"/>
      <rect y="10" width="16" height="2" rx="1"/>
    </svg>
  </div>
);
