'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, LayoutGrid, Filter, Plus, Flame, CheckCircle2, X } from 'lucide-react'
import Link from 'next/link'

// ✨ Import Components & Types
import { Task, Project } from '@/types/task'
import { TaskCard } from '@/components/task/TaskCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { WeeklyCalendar } from '@/components/task/WeeklyCalendar'
import { MonthlyGoals } from '@/components/dashboard/MonthlyGoals'
import { MonthlySummary } from '@/components/dashboard/MonthlySummary'

export default function DashboardPage() {
  const supabase = createClient()

  // States
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [activeProjectId, setActiveProjectId] = useState('All')

  const [referenceDate, setReferenceDate] = useState(new Date())

  // --- 1. Fetch Data ---
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

  // --- 2. Grouping & Filtering Logic ---
  const groupedTasks = useMemo(() => {
    const filtered = tasks.filter(t => {
      const matchProject = activeProjectId === 'All' || t.project_id === activeProjectId
      const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.assignee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      return matchProject && matchSearch
    })

    return {
      urgent: filtered.filter(t => t.priority === 'High' && !t.is_completed),
      stream: filtered.filter(t => t.priority !== 'High' && !t.is_completed),
      finished: filtered.filter(t => t.is_completed)
    }
  }, [searchTerm, activeProjectId, tasks])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 gap-4 font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="font-black uppercase tracking-widest text-[10px] italic">Syncing Board...</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700 px-4 md:px-8">

      {/* 3. Page Header */}
      <PageHeader
        title="Control Center"
        subtitle={`Urgent: ${groupedTasks.urgent.length} / Total Active: ${groupedTasks.urgent.length + groupedTasks.stream.length}`}
        icon={<LayoutGrid size={16} />}
      >
        <Link
          href="/create"
          className="bg-slate-900 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2.5 hover:bg-blue-600 transition-all shadow-lg active:scale-95 shrink-0"
        >
          <Plus size={20} />
          <span className="text-[11px] font-black uppercase tracking-widest">New Task</span>
        </Link>
      </PageHeader>

      {/* <MonthlySummary
        tasks={tasks}
        projects={projects}
        currentReferenceDate={referenceDate}
      /> */}

      <MonthlyGoals tasks={tasks} projects={projects} currentReferenceDate={referenceDate} />

      {/* 4. Weekly Calendar */}
      <WeeklyCalendar
        tasks={tasks}
        referenceDate={referenceDate} // ส่งค่าวันที่ไปโชว์
        onDateChange={setReferenceDate} // ✨ ส่งตัวเปลี่ยนค่าไปใช้งาน (แก้ Error ts(6133))
      />

      {/* 5. Filter & Search Section */}
      <div className="space-y-4">
        {/* Project Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-400 mr-1 shrink-0">
            <Filter size={16} />
          </div>
          <button
            onClick={() => setActiveProjectId('All')}
            className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeProjectId === 'All'
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
              : 'bg-white text-slate-400 border border-slate-50 hover:bg-slate-50'
              }`}
          >
            All
          </button>
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setActiveProjectId(project.id)}
              className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeProjectId === project.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                : 'bg-white text-slate-400 border border-slate-50 hover:bg-slate-50'
                }`}
            >
              {project.name}
            </button>
          ))}
        </div>

        {/* ✨ Search Bar - เพิ่มปุ่ม Clear (X) */}
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={14} />
          <input
            type="text"
            placeholder="Quick search assets or assignee..."
            className="w-full pl-10 pr-10 py-3 bg-white/60 rounded-xl border border-slate-100 shadow-sm outline-none font-bold text-[11px] focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-200 transition-all placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors p-1"
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      {/* 6. 🔥 URGENT SECTION */}
      {groupedTasks.urgent.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-xl text-white shadow-md animate-pulse">
              <Flame size={16} />
            </div>
            <h2 className="text-xl font-black text-slate-800 italic tracking-tighter uppercase">Urgent Assets</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {groupedTasks.urgent.map((task) => (
              <TaskCard key={task.id} task={task} projects={projects} />
            ))}
          </div>
        </section>
      )}

      {/* 7. 📋 WORK STREAM */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md">
            <LayoutGrid size={16} />
          </div>
          <h2 className="text-xl font-black text-slate-800 italic tracking-tighter uppercase">Work Stream</h2>
        </div>

        {groupedTasks.stream.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {groupedTasks.stream.map((task) => (
              <TaskCard key={task.id} task={task} projects={projects} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
            <p className="text-slate-300 text-xs font-bold italic">No active assets in queue.</p>
          </div>
        )}
      </section>

      {/* 8. ✅ RECENTLY FINISHED */}
      {groupedTasks.finished.length > 0 && (
        <section className="pt-8 border-t border-slate-100 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-slate-200 p-2 rounded-xl text-slate-500">
              <CheckCircle2 size={16} />
            </div>
            <h2 className="text-sm font-black text-slate-400 italic tracking-tighter uppercase">Finished</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {groupedTasks.finished.map((task) => (
              <TaskCard key={task.id} task={task} projects={projects} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}