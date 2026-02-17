'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, LayoutGrid, Filter, Plus, Flame, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

// ✨ Import Components & Types
import { Task, Project } from '@/types/task'
import { TaskCard } from '@/components/task/TaskCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { WeeklyCalendar } from '@/components/task/WeeklyCalendar'

export default function DashboardPage() {
  const supabase = createClient()

  // States
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [activeProjectId, setActiveProjectId] = useState('All')

  // --- 1. Fetch Data (ดึงทั้งงานที่ทำอยู่และงานที่เสร็จแล้ว) ---
  useEffect(() => {
    async function fetchData() {
      try {
        const [tRes, pRes] = await Promise.all([
          supabase.from('tasks').select('*').order('created_at', { ascending: false }),
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

  // --- 2. Grouping & Filtering Logic (Optimized) ---
  const groupedTasks = useMemo(() => {
    // กรองตามโปรเจกต์และชื่อก่อน
    const filtered = tasks.filter(t => {
      const matchProject = activeProjectId === 'All' || t.project_id === activeProjectId
      const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.assignee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      return matchProject && matchSearch
    })

    // แยกกลุ่มตาม Priority และ Status
    return {
      urgent: filtered.filter(t => t.priority === 'High' && !t.is_completed),
      stream: filtered.filter(t => t.priority !== 'High' && !t.is_completed),
      finished: filtered.filter(t => t.is_completed)
    }
  }, [searchTerm, activeProjectId, tasks])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="font-black uppercase tracking-widest text-xs italic">Syncing Cyne Board...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20 animate-in fade-in duration-700">

      {/* 3. Page Header */}
      <PageHeader
        title="Control Center"
        subtitle={`วันนี้คุณปันมีงานด่วน ${groupedTasks.urgent.length} รายการที่ต้องเร่งมือนะค๊ะ!`}
        icon={<LayoutGrid size={16} />}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="ค้นหางานหรือชื่อคน..."
              className="w-full pl-14 pr-6 py-4 bg-white rounded-3xl border-none shadow-2xl shadow-slate-200/40 outline-none font-bold text-sm focus:ring-4 focus:ring-blue-500/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Link href="/create" className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
            <Plus size={24} />
          </Link>
        </div>
      </PageHeader>

      {/* 4. Weekly Calendar */}
      <WeeklyCalendar tasks={tasks} />

      {/* 5. Project Filter Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide px-2">
        <div className="bg-slate-100 p-3 rounded-2xl text-slate-400 mr-2 shrink-0">
          <Filter size={20} />
        </div>

        <button
          onClick={() => setActiveProjectId('All')}
          className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeProjectId === 'All'
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
            className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeProjectId === project.id
              ? 'bg-blue-600 text-white shadow-xl shadow-blue-200'
              : 'bg-white text-slate-400 border border-slate-50 hover:bg-slate-50'
              }`}
          >
            {project.name}
          </button>
        ))}
      </div>

      {/* 6. 🔥 URGENT SECTION (High Priority) */}
      {groupedTasks.urgent.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center gap-4 ml-2">
            <div className="bg-red-500 p-2.5 rounded-2xl text-white shadow-lg shadow-red-200 animate-pulse">
              <Flame size={20} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 italic tracking-tighter uppercase">
              Urgent Assets <span className="text-red-500/40 text-sm ml-2 font-medium">/ High Priority</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groupedTasks.urgent.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* 7. 📋 WORK STREAM (Normal Priority) */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 ml-2">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-100">
            <LayoutGrid size={20} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 italic tracking-tighter uppercase">
            Work Stream <span className="text-slate-300 text-sm ml-2 font-medium">/ Normal Queue</span>
          </h2>
        </div>

        {groupedTasks.stream.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groupedTasks.stream.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold italic">No pending tasks in this project.</p>
          </div>
        )}
      </section>

      {/* 8. ✅ RECENTLY FINISHED */}
      {groupedTasks.finished.length > 0 && (
        <section className="pt-10 border-t border-slate-100 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <div className="flex items-center gap-4 ml-2 mb-8">
            <div className="bg-slate-200 p-2.5 rounded-2xl text-slate-500">
              <CheckCircle2 size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-400 italic tracking-tighter uppercase">
              Recently Finished
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {groupedTasks.finished.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}