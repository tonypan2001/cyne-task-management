'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Trophy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// ✨ Import สิ่งที่เราแยกไว้ค่ะ
import { Task } from '@/types/task'
import { TaskCard } from '@/components/task/TaskCard'
import { PageHeader } from '@/components/shared/PageHeader'

export default function CompletedTasksPage() {
    const supabase = createClient()
    const [completedTasks, setCompletedTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCompleted() {
            try {
                const { data, error } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('is_completed', true)
                    .order('created_at', { ascending: false })

                if (error) throw error
                if (data) setCompletedTasks(data as Task[])
            } catch (err) {
                console.error('Error fetching completed tasks:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchCompleted()
    }, [supabase])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
                <p className="font-black uppercase tracking-widest text-[10px]">Fetching your achievements...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in slide-in-from-bottom-4 duration-700">

            {/* ✨ ใช้ PageHeader ให้เหมือนหน้า Dashboard */}
            <PageHeader
                title="Completed Tasks"
                subtitle={`ยอดเยี่ยมมากค่ะคุณปัน! คุณทำโปรเจกต์เสร็จสมบูรณ์ไปแล้ว ${completedTasks.length} รายการ`}
                icon={<Trophy size={16} className="text-yellow-500" />}
            >
                <Link
                    href="/"
                    className="flex items-center gap-2 px-6 py-4 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-slate-800 transition-all font-bold text-sm shadow-sm"
                >
                    <ArrowLeft size={18} />
                    Back to Board
                </Link>
            </PageHeader>

            {/* Task Grid */}
            {completedTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {completedTasks.map((task) => (
                        <div key={task.id} className="opacity-80 hover:opacity-100 transition-opacity">
                            <TaskCard task={task} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                    <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-200">
                        <Trophy size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 italic">No completed tasks yet</h3>
                    <p className="text-slate-400 mt-2 font-medium">สู้ๆ นะค๊ะคุณปัน งานที่ทำเสร็จจะมาโชว์ที่นี่เพื่อเป็นกำลังใจให้ค่ะ</p>
                    <Link
                        href="/"
                        className="inline-block mt-8 px-10 py-4 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all"
                    >
                        Go to Active Board
                    </Link>
                </div>
            )}
        </div>
    )
}