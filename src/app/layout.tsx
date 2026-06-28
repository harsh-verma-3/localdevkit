import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from './ThemeProvider';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: {
    default: 'LocalDevKit — Privacy-First Developer Toolbox',
    template: '%s | LocalDevKit',
  },
  description:
    'A free, browser-based developer toolbox. Format JSON, encode Base64, decode JWTs, generate passwords, convert timestamps, and more — all processed locally. No data ever leaves your device.',
  keywords: [
    'developer tools',
    'json formatter',
    'base64 encoder',
    'jwt decoder',
    'password generator',
    'privacy',
    'offline',
    'browser tools',
  ],
  authors: [{ name: 'LocalDevKit' }],
  creator: 'LocalDevKit',
  metadataBase: new URL('https://localdevkit.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://localdevkit.app',
    siteName: 'LocalDevKit',
    title: 'LocalDevKit — Privacy-First Developer Toolbox',
    description:
      'Free browser-based tools for developers. Everything runs locally — your data never leaves your device.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LocalDevKit — Privacy-First Developer Toolbox',
    description: 'Free browser-based tools. Your data stays on your device.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f9fc' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent flash of wrong theme before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = JSON.parse(localStorage.getItem('localdevkit-settings') || '{}');
                  var theme = (stored.state && stored.state.theme) || 'system';
                  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
