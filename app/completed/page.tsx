'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Trophy, ArrowLeft, LayoutGrid } from 'lucide-react'
import Link from 'next/link'

// ✨ Import Components & Types
import { Task, Project } from '@/types/task'
import { TaskCard } from '@/components/task/TaskCard'
import { PageHeader } from '@/components/shared/PageHeader'

export default function CompletedTasksPage() {
    const supabase = createClient()
    const [completedTasks, setCompletedTasks] = useState<Task[]>([])
    const [projects, setProjects] = useState<Project[]>([]) // ✨ เพิ่ม State เก็บ projects
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchAchievementData() {
            try {
                // ✨ ดึงทั้งงานที่เสร็จแล้วและข้อมูลโปรเจกต์พร้อมกัน
                const [tRes, pRes] = await Promise.all([
                    supabase.from('tasks').select('*').eq('is_completed', true).order('created_at', { ascending: false }),
                    supabase.from('projects').select('*').order('name')
                ])

                if (tRes.data) setCompletedTasks(tRes.data as Task[])
                if (pRes.data) setProjects(pRes.data as Project[])
            } catch (err) {
                console.error('Error fetching achievements:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchAchievementData()
    }, [supabase])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 gap-4 font-sans">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
                <p className="font-black uppercase tracking-widest text-[10px] italic">Collecting your victories...</p>
            </div>
        )
    }

    return (
        <div className="max-w-[1440px] mx-auto space-y-10 pb-20 animate-in slide-in-from-bottom-4 duration-700 px-4 md:px-8">

            <PageHeader
                title="Hall of Fame"
                subtitle={`คุณทำโปรเจกต์เสร็จสมบูรณ์ไปแล้ว ${completedTasks.length} รายการ ยอดเยี่ยมที่สุด!`}
                icon={<Trophy size={16} className="text-yellow-500" />}
            >
                <Link
                    href="/"
                    className="flex items-center gap-2.5 px-6 py-3.5 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-slate-800 hover:border-blue-200 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                >
                    <ArrowLeft size={16} />
                    Back to Board
                </Link>
            </PageHeader>

            {/* Task Grid */}
            {completedTasks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {completedTasks.map((task) => (
                        <div key={task.id} className="opacity-70 hover:opacity-100 transition-all duration-500 hover:scale-[1.02]">
                            {/* ✨ ส่ง projects เข้าไปเพื่อแก้ Error ts(2741)  */}
                            <TaskCard task={task} projects={projects} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                    <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-200">
                        <Trophy size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 italic uppercase">No Trophies Yet</h3>
                    <p className="text-slate-400 mt-2 font-bold text-sm">งานที่ทำเสร็จจะมาโชว์ที่นี่</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-3 mt-8 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95"
                    >
                        <LayoutGrid size={16} />
                        Start New Task
                    </Link>
                </div>
            )}
        </div>
    )
}