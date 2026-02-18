'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { ToastProvider } from '../shared/ToastProvider'

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // ✨ เช็คหน้าที่ไม่ต้องการ Sidebar (รวมทั้ง /auth และ /login ตามที่คุณปันทำไว้ค่ะ)
    const noSidebarPages = ['/auth', '/login']
    const showSidebar = !noSidebarPages.includes(pathname)

    return (
        <ToastProvider>
            <div className="flex min-h-screen">
                {showSidebar && (
                    <aside className="w-64 shrink-0 border-r border-slate-100 hidden md:block">
                        <Sidebar />
                    </aside>
                )}

                <main className="flex-1 min-w-0 h-screen overflow-y-auto p-6 md:p-10 lg:p-12">
                    <div className="max-w-[1440px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </ToastProvider>
    )
}