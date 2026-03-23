'use client';
import dynamic from 'next/dynamic';

// Load ClientApp only on the client — it uses localStorage, Web Audio API,
// navigator, and other browser-only APIs that crash during SSR.
const ClientApp = dynamic(
  () => import('./ClientApp'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        position:'fixed', inset:0, background:'#283618',
        display:'flex', alignItems:'center', justifyContent:'center',
        flexDirection:'column', gap:12, fontFamily:"'Open Sans', sans-serif",
      }}>
        <div style={{width:56,height:56,borderRadius:14,border:'2px solid rgba(255,255,255,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:28,fontWeight:700,color:'#FFFFFF',letterSpacing:'-0.03em'}}>B</span>
        </div>
        <p style={{color:'rgba(255,255,255,0.6)',fontSize:14}}>Loading…</p>
      </div>
    ),
  }
);

export default function AppShell() {
  return <ClientApp />;
}
