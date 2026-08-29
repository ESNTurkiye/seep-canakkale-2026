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
    // The card everyone actually sees: a link to this site is pasted into a
    // section's WhatsApp group long before anybody opens it, and without an
    // image that paste is a grey rectangle. Resolved against `metadataBase`
    // above, because every scraper demands an absolute URL. Issue #6.
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: `${event.name} — ${event.dateLabel}, ${event.city}`,
      },
    ],
  },
  // Next infers the Twitter card from openGraph, but it infers the small one.
  // A 1200 x 630 image in a `summary` card is shown as a thumbnail beside the
  // title; this is the card the image was made for.
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
