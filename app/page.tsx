'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import NextImage from 'next/image'
import Link from 'next/link'
import { Calendar, CheckCircle2, Clock, Search, Filter, LayoutGrid } from 'lucide-react'

// --- 1. กำหนด Interface ---
interface Task {
  id: string
  title: string
  category: string
  image_url: string | null
  assignee_name: string | null
  created_at: string
}

export default function DashboardPage() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  // --- 2. ดึงข้อมูลจาก Supabase ---
  useEffect(() => {
    async function fetchTasks() {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data) setTasks(data)
      } catch (err) {
        console.error('Error fetching tasks:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [supabase])

  // --- 3. ประมวลผลการกรองงาน (ใช้ useMemo เพื่อลดการ Render ซ้ำ) ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesCategory = activeCategory === 'All' || task.category === activeCategory
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.assignee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      return matchesCategory && matchesSearch
    })
  }, [searchTerm, activeCategory, tasks])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="font-medium animate-pulse">กำลังเตรียม Board ของคุณปันนะค๊ะ...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header & Search */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <LayoutGrid size={20} />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Workspace</span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Board Control</h1>
          <p className="text-slate-400 font-medium">จัดการงานทั้งหมดของคุณปันได้ในที่เดียวค่ะ</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="ค้นหาชื่องาน หรือผู้รับผิดชอบ..."
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] outline-none shadow-xl shadow-slate-200/40 focus:ring-4 focus:ring-blue-500/5 transition-all font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl text-slate-500 mr-2">
          <Filter size={16} />
          <span className="text-[10px] font-black uppercase tracking-wider">Filters</span>
        </div>
        {['All', 'Work', 'Freelance', 'Personal', 'General'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeCategory === cat
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-300 active:scale-95'
                : 'bg-white text-slate-400 border border-slate-50 hover:bg-slate-50'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Task Grid */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTasks.map((task) => (
            <Link
              href={`/task/${task.id}`}
              key={task.id}
              className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-blue-200/40 hover:-translate-y-1 transition-all flex flex-col h-full"
            >
              {/* Task Thumbnail */}
              <div className="relative w-full h-52 bg-slate-50 overflow-hidden">
                {task.image_url ? (
                  <NextImage
                    src={task.image_url}
                    alt={task.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <LayoutGrid size={48} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-blue-600 text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm">
                    {task.category}
                  </span>
                </div>
              </div>

              {/* Task Content */}
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                    <Calendar size={12} />
                    {new Date(task.created_at).toLocaleDateString('th-TH')}
                  </div>
                  <Clock size={14} className="text-slate-100 group-hover:text-blue-100 transition-colors" />
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-6 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                  {task.title}
                </h3>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm font-black text-xs">
                      {task.assignee_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-slate-300 uppercase">Assignee</span>
                      <span className="text-xs font-bold text-slate-600">{task.assignee_name || 'Unassigned'}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                    <CheckCircle2 size={18} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">ไม่พบบอร์ดงานที่ค้นหาค่ะ</h3>
          <p className="text-slate-400 mt-2">ลองเปลี่ยนคำค้นหา หรือสร้างงานใหม่ดูนะค๊ะคุณปัน</p>
          <Link href="/create" className="inline-block mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
            สร้างงานใหม่ตอนนี้
          </Link>
        </div>
      )}
    </div>
  )
}