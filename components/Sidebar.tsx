'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LogOut, Layout as LogoIcon } from 'lucide-react'
import { useAdmin } from '@/hook/useAdmin'
import { menuItems } from '@/constants/menu'

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    // ✨ ใช้ adminLoading เพื่อรอสถานะการเช็คสิทธิ์ให้ชัวร์ก่อนค่ะ
    const { isAdmin, loading: adminLoading } = useAdmin()

    const [displayName, setDisplayName] = useState<string>('Loading...')

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.email) {
                const namePart = user.email.split('@')[0]
                setDisplayName(namePart)
            }
        }
        fetchUser()
    }, [supabase.auth])

    const handleLogout = async () => {
        // ✨ ล้างความจำ Workspace ก่อนออกจากระบบค๊ะ
        localStorage.removeItem('active_workspace_id')
        await supabase.auth.signOut()
        router.push('/auth')
        router.refresh()
    }

    if (pathname === "/workspaces") {
        return null
    }

    return (
        <aside className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-20 font-sans">
            {/* Logo Section */}
            <div className="p-8 flex items-center gap-3">
                <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-xl shadow-slate-200">
                    <LogoIcon size={22} strokeWidth={2.5} />
                </div>
                <span className="text-xl font-black tracking-tighter text-slate-900 italic uppercase">
                    Cyne<span className="text-blue-600">.</span>
                </span>
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 px-4 space-y-1.5">
                <p className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Main Menu</p>
                {menuItems.map((item) => {
                    // ✨ 1. เช็คเงื่อนไข: ถ้าชื่อเมนูคือ "สร้างงานใหม่" และไม่ใช่แอดมิน ให้ข้ามไปเลยค่ะ
                    if (item.name === 'สร้างงานใหม่' && !adminLoading && !isAdmin) {
                        return null;
                    }

                    const isActive = pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${isActive
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 translate-x-1'
                                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800 hover:translate-x-1'
                                }`}
                        >
                            <item.icon
                                size={18}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={isActive ? 'text-white' : 'text-blue-600'}
                            />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* User & Logout Section */}
            <div className="p-6 border-t border-slate-50 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center font-black text-blue-600 shadow-sm border border-slate-100 uppercase italic text-xs">
                        {displayName.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight italic truncate">
                            {displayName}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                            Designer Account
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                >
                    <LogOut size={16} strokeWidth={2.5} />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}