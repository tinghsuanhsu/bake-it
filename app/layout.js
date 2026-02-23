export const metadata = {
  title: 'Bake it',
  description: 'Sourdough baking tracker',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Bake it',
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#283618" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Preconnect early so font loads before first paint */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* font-display=swap ensures the B renders in Open Sans as soon as it's ready */}
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@800&display=swap"
          rel="stylesheet"
        />
        {/* Load remaining weights after critical weight 800 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#283618' }}>
        {children}
      </body>
    </html>
  );
}
