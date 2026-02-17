'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, LayoutGrid, Filter, Plus } from 'lucide-react'
import Link from 'next/link'

// ✨ Import สิ่งที่เราแยกไฟล์ไว้
import { Task, Project } from '@/types/task'
import { TaskCard } from '@/components/task/TaskCard'
import { PageHeader } from '@/components/shared/PageHeader'

export default function DashboardPage() {
  const supabase = createClient()

  // States
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [activeProjectId, setActiveProjectId] = useState('All')

  // --- 1. Fetch Data ---
  useEffect(() => {
    async function fetchData() {
      try {
        const [tRes, pRes] = await Promise.all([
          supabase.from('tasks').select('*').eq('is_completed', false).order('created_at', { ascending: false }),
          supabase.from('projects').select('*').order('name')
        ])

        if (tRes.data) setTasks(tRes.data as Task[])
        if (pRes.data) setProjects(pRes.data as Project[])
      } catch (err) {
        console.error('Error loading dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  // --- 2. Filter Logic (Optimized with useMemo) ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchProject = activeProjectId === 'All' || t.project_id === activeProjectId
      const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.assignee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      return matchProject && matchSearch
    })
  }, [searchTerm, activeProjectId, tasks])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="font-black uppercase tracking-widest text-xs">Synchronizing Board...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">

      {/* ✨ 3. ใช้ PageHeader Component ที่เราสร้างไว้ */}
      <PageHeader
        title="Projects Board"
        subtitle={`คุณปันมีงานที่ต้องดูแลทั้งหมด ${filteredTasks.length} รายการในวันนี้ค่ะ`}
        icon={<LayoutGrid size={16} />}
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="ค้นหางานหรือชื่อคน..."
              className="w-full pl-14 pr-6 py-4 bg-white rounded-[1.5rem] border-none shadow-2xl shadow-slate-200/40 outline-none font-bold text-sm focus:ring-4 focus:ring-blue-500/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Quick Create Link */}
          <Link href="/create" className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
            <Plus size={24} />
          </Link>
        </div>
      </PageHeader>

      {/* ✨ 4. Project Filter Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
        <div className="bg-slate-100 p-3 rounded-2xl text-slate-400 mr-2">
          <Filter size={20} />
        </div>

        <button
          onClick={() => setActiveProjectId('All')}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeProjectId === 'All'
              ? 'bg-slate-900 text-white shadow-xl shadow-slate-300'
              : 'bg-white text-slate-400 border border-slate-50 hover:bg-slate-50'
            }`}
        >
          All Assets
        </button>

        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setActiveProjectId(project.id)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeProjectId === project.id
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200'
                : 'bg-white text-slate-400 border border-slate-50 hover:bg-slate-50'
              }`}
          >
            {project.name}
          </button>
        ))}
      </div>

      {/* ✨ 5. Task Grid โดยใช้ TaskCard Component */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 italic">No matching tasks found</h3>
          <p className="text-slate-400 mt-2 font-medium">ลองเปลี่ยนโปรเจกต์หรือคำค้นหาดูนะค๊ะคุณปัน</p>
        </div>
      )}
    </div>
  )
}