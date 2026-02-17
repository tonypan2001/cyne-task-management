'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { 
  LayoutDashboard, PlusSquare, LogOut, CheckCircle2, Layout as LogoIcon, User 
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'สร้างงานใหม่', path: '/create', icon: PlusSquare },
    { name: 'งานที่เสร็จแล้ว', path: '/completed', icon: CheckCircle2 },
  ]

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="p-8 flex items-center gap-3 text-blue-600">
        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
          <LogoIcon size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-800">Cyne Task</span>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
              pathname === item.path 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <item.icon size={20} />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* User & Logout Section */}
      <div className="p-4 border-t border-slate-50 space-y-2">
        <div className="flex items-center gap-3 px-4 py-3 text-slate-500">
          <div className="bg-slate-100 p-2 rounded-full">
            <User size={18} />
          </div>
          <span className="text-xs font-semibold truncate">คุณปัน (User)</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={20} />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}