import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
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
        <div className="flex min-h-screen">

          {/* ✨ กำหนดความกว้างให้ชัดเจน (เช่น w-64 คือ 256px) 
              และใช้ shrink-0 เพื่อไม่ให้ flex บีบ Sidebar จนเพี้ยนค่ะ */}
          <aside className="w-64 shrink-0 border-r border-slate-100 hidden md:block">
            <Sidebar />
          </aside>

          {/* ส่วนเนื้อหาจะขยับไปอยู่ต่อจากความกว้าง 64 ของ Sidebar ทันทีค่ะ */}
          <main className="flex-1 min-w-0 h-screen overflow-y-auto p-6 md:p-10 lg:p-12">
            <div className="max-w-[1440px] mx-auto">
              {children}
            </div>
          </main>

        </div>
      </body>
    </html>
  )
}