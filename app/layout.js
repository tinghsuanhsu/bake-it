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
        {/* viewport-fit=cover lets content extend into status bar area */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Match status bar colour to nav */}
        <meta name="theme-color" content="#283618" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      {/* Body bg matches nav so status bar area is seamless */}
      <body style={{ margin: 0, padding: 0, background: '#283618' }}>
        {children}
      </body>
    </html>
  );
}
