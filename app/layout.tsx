import type { Metadata } from 'next'
import './globals.css'
import { lineSeed } from './fonts'

export const metadata: Metadata = {
  title: 'Cyne | Creative Management',
  description: 'Manage your creative assets and tasks with precision.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={`${lineSeed.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}