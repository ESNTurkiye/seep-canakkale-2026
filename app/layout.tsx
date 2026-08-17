import type { Metadata } from 'next'
import { Oswald, Lato } from 'next/font/google'
import { event } from '@/content/event'
import './globals.css'

const display = Oswald({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
})

const body = Lato({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  metadataBase: new URL(`https://${event.domain}`),
  title: `${event.name} — ${event.platform}`,
  description: `The South-Eastern European Platform comes to Çanakkale, ${event.dateLabel}. Fifteen countries, one strait, four days. Hosted by ${event.hostSection}.`,
  openGraph: {
    title: `${event.name}`,
    description: `Fifteen countries, one strait, four days. ${event.dateLabel}.`,
    locale: 'en_GB',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
