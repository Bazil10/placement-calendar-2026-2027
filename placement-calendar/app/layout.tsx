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
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-touch-fullscreen': 'yes',
  },
}
export const viewport: Viewport = {
  )
}
