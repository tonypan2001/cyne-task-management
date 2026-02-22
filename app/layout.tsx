import type { Metadata } from 'next'
import './globals.css'
import { lineSeed } from './fonts'
import MainLayout from '@/components/layout/MainLayout' // ✨ นำเข้าตัวที่เราสร้างตะกี้

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
        {/* ✨ ใช้ MainLayout มาคุมเนื้อหาข้างในแทน */}
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  )
}