'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname()
    
    // ✨ เช็คว่ากำลังอยู่หน้า workspaces หรือเปล่า
    const isWorkspacePage = pathname === '/workspaces'

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* 1. ซ่อน Sidebar ถ้าอยู่หน้า Workspace */}
            {!isWorkspacePage && <Sidebar />}
            
            {/* 2. หดระยะขอบกลับมาให้เต็มจอ ถ้าอยู่หน้า Workspace */}
            <main className={`flex-1 transition-all duration-300 ${isWorkspacePage ? 'ml-0' : 'ml-64'}`}>
                {children}
            </main>
        </div>
    )
}