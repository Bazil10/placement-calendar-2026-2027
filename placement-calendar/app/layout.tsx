import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})
export const metadata: Metadata = {
  title: 'Placement Drive Calendar',
  description: 'Campus placement drive scheduling and tracking for coordinators and admins',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PlaceDrive',
  },
  icons: {
    apple: '/icons/icon-192.png',
    icon: '/icons/icon-192.png',
  },
}
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#001e2b',
  themeColor: [{ color: '#001e2b' }],
}
export default function RootLayout({
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PlaceDrive" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans bg-surface text-ink antialiased">
        {children}
    </html>
  )
}
