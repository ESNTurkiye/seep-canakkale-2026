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

const siteUrl =
  (process.env.VERCEL_ENV === 'preview' &&
    process.env.VERCEL_URL &&
    `https://${process.env.VERCEL_URL}`) ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  `https://${event.domain}`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${event.name} — ${event.platform}`,
  description: `The South-Eastern European Platform comes to Çanakkale, ${event.dateLabel}. Fifteen countries, one strait, four days. Hosted by ${event.hostSection}.`,
  // Favicon set generated with favicon.io from the SEEP mark. The two-pixel
  // sizes give crisp tabs everywhere; the .ico keeps old clients happy.
  // `manifest` drives the PWA-style "Add to Home Screen" icons on mobile.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
  // Match the browser chrome to the site's ink background, not the accent —
  // SEEP green is only ever used on dark ground, per the ESN contrast rule.
  themeColor: '#0f1012',
  openGraph: {
    title: `${event.name}`,
    description: `Fifteen countries, one strait, four days. ${event.dateLabel}.`,
    locale: 'en_GB',
    type: 'website',
    // What Discord prints above the title, so the card reads as coming from
    // the platform rather than an anonymous paste. Deliberately not the event
    // name — that is already the og:title, and repeating it would be noise.
    siteName: event.platform,
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
