import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Přežij Monetu',
  description: 'Anonymní corporate survival game. Bojuj proti systému. Přežij Vzpurného.',
  // Žádné trackingové metadaty, žádné analytiky
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" className="dark">
      <head>
        {/* Žádné trackingové skripty, žádná analytics — privacy-first */}
        <meta name="robots" content="noindex, nofollow" />
        <meta name="theme-color" content="#05050f" />
      </head>
      <body className="antialiased bg-[#05050f] text-gray-300 min-h-screen">
        {children}
      </body>
    </html>
  )
}
