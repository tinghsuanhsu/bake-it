import dynamic from 'next/dynamic';

// ClientApp is a fully client-side component (uses localStorage, Web Audio, etc.)
// Disable SSR to prevent prerender errors from browser-only APIs and
// module initialisation ordering issues during static generation.
const ClientApp = dynamic(() => import('./ClientApp'), { ssr: false });

export default function Page() {
  return <ClientApp />;
}
