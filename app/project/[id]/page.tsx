'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Target, CheckCircle2, Clock, Plus } from 'lucide-react'
import Link from 'next/link'

// ✨ Import Components & Types
import { Task, Project } from '@/types/task'
import { TaskCard } from '@/components/task/TaskCard'
import { PageHeader } from '@/components/shared/PageHeader'

export default function ProjectDetailPage() {
    const { id } = useParams()
    const supabase = createClient()

    const [project, setProject] = useState<Project | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [allProjects, setAllProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProjectDetail() {
            try {
                const [pRes, tRes, allPRes] = await Promise.all([
                    supabase.from('projects').select('*').eq('id', id).single(),
                    supabase.from('tasks').select('*').eq('project_id', id).order('created_at', { ascending: false }),
                    supabase.from('projects').select('*')
                ])

                if (pRes.data) setProject(pRes.data as Project)
                if (tRes.data) setTasks(tRes.data as Task[])
                if (allPRes.data) setAllProjects(allPRes.data as Project[])
            } catch (err) {
                console.error('Error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchProjectDetail()
    }, [id, supabase])

    // ✨ คำนวณสถิติภายในโปรเจกต์
    const stats = useMemo(() => {
        const completed = tasks.filter(t => t.is_completed).length
        const total = tasks.length
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0
        return { completed, total, progress }
    }, [tasks])

    if (loading) return <div className="p-20 text-center font-black italic text-slate-300">Loading Project Insight...</div>
    if (!project) return <div className="p-20 text-center font-black italic text-red-400">Project Not Found</div>

    return (
        <div className="max-w-[1440px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700 px-4 md:px-8">

            <PageHeader
                title={project.name}
                subtitle={`Overview of all creative assets for this project.`}
                icon={<Target size={16} className="text-blue-500" />}
            >
                <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-slate-800 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm">
                    <ArrowLeft size={16} /> Back
                </Link>
            </PageHeader>

            {/* 📊 Project Health Card */}
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Completion Rate</p>
                        <h2 className="text-6xl font-black italic">{stats.progress}%</h2>
                    </div>
                    <div className="flex flex-col justify-center border-l border-white/10 pl-10">
                        <p className="text-slate-400 text-xs font-bold mb-1">Total Assets: {stats.total}</p>
                        <p className="text-green-400 text-xs font-bold">Finished: {stats.completed}</p>
                    </div>
                    <div className="flex items-center justify-end">
                        <Link href={`/create?project_id=${id}`} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 flex items-center gap-3">
                            <Plus size={18} /> Add New Asset
                        </Link>
                    </div>
                </div>
            </div>

            {/* 📋 Tasks Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Active Stream */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 ml-2">
                        <Clock size={18} className="text-orange-500" />
                        <h3 className="text-xl font-black text-slate-800 italic uppercase">Active Stream</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        {tasks.filter(t => !t.is_completed).map(task => (
                            <TaskCard key={task.id} task={task} projects={allProjects} />
                        ))}
                    </div>
                </section>

                {/* Finished Stream */}
                <section className="space-y-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-3 ml-2">
                        <CheckCircle2 size={18} className="text-green-500" />
                        <h3 className="text-xl font-black text-slate-400 italic uppercase">Finished Assets</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        {tasks.filter(t => t.is_completed).map(task => (
                            <TaskCard key={task.id} task={task} projects={allProjects} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}