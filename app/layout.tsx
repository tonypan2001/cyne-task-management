import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Sidebar from '@/components/Sidebar'

// ✨ การตั้งค่าฟอนต์ LINE Seed Sans TH
const lineSeed = localFont({
  src: [
    { path: '../public/fonts/LINESeedSansTH_W_Th.woff2', weight: '100', style: 'normal' },
    { path: '../public/fonts/LINESeedSansTH_W_Rg.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/LINESeedSansTH_W_Bd.woff2', weight: '700', style: 'normal' },
    { path: '../public/fonts/LINESeedSansTH_W_XBd.woff2', weight: '800', style: 'normal' },
    { path: '../public/fonts/LINESeedSansTH_W_He.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-line-seed',
})

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
        <div className="flex min-h-screen">
          {/* ✨ เพิ่ม Sidebar ไว้ที่ด้านซ้าย */}
          <Sidebar />

          {/* ✨ ส่วนเนื้อหาหลักจะอยู่ด้านขวาและเลื่อนได้ (Scrollable) */}
          <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}