'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { ToastProvider } from '../shared/ToastProvider'
import { TopBar } from './Topbar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const noSidebarPages = ['/auth', '/login', '/workspaces']
    const showSidebar = !noSidebarPages.includes(pathname)

    return (
        <ToastProvider>
            <div className="flex min-h-screen">
                {showSidebar && (
                    <aside className="w-64 shrink-0 border-r border-slate-100 hidden md:block">
                        <Sidebar />
                    </aside>
                )}

                {/* ✨ เปลี่ยน Padding ออกจาก main ย้ายไปไว้ที่ div ด้านใน เพื่อให้ TopBar ติดขอบบนสุด */}
                <main className="flex-1 min-w-0 h-screen overflow-y-auto bg-slate-50 relative">

                    {/* ✨ โชว์ TopBar เฉพาะหน้าที่มี Sidebar  */}
                    {showSidebar && <TopBar />}

                    <div className="p-6 md:p-10 lg:p-12 max-w-[1440px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </ToastProvider>
    )
}