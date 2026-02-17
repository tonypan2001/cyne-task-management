'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { CheckCircle2, ArrowLeft, Trophy } from 'lucide-react'

// ✨ กำหนด Interface แทนการใช้ any
interface Task {
    id: string
    title: string
    category: string
    assignee_name: string | null
    is_completed: boolean
    created_at: string
}

export default function CompletedTasksPage() {
    const supabase = createClient()
    const [tasks, setTasks] = useState<Task[]>([]) // ✨ ใช้ Task[]
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCompleted() {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('is_completed', true)
                .order('created_at', { ascending: false })

            if (!error && data) {
                setTasks(data as Task[])
            }
            setLoading(false)
        }
        fetchCompleted()
    }, [supabase])

    if (loading) return <div className="p-10 text-slate-400 font-medium">กำลังโหลดผลงานที่สำเร็จแล้ว...</div>

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3">
                        <div className="bg-yellow-100 p-2 rounded-2xl">
                            <Trophy className="text-yellow-500" size={32} />
                        </div>
                        Completed Tasks
                    </h1>
                    <p className="text-slate-400 font-medium mt-2">รวมผลงานที่คุณปันทำสำเร็จแล้วค่ะ ยอดเยี่ยมมาก!</p>
                </div>
                <Link href="/" className="p-4 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-slate-800 transition-all shadow-sm">
                    <ArrowLeft size={24} />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tasks.map(task => (
                    <Link href={`/task/${task.id}`} key={task.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 group hover:border-green-200 transition-all shadow-sm">
                        <div className="bg-green-50 p-4 rounded-2xl text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                            <CheckCircle2 size={32} />
                        </div>
                        <div className="flex-1">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{task.category}</span>
                            <h3 className="text-xl font-bold text-slate-700 line-through decoration-slate-300 group-hover:decoration-green-500 transition-all">{task.title}</h3>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">Assignee: {task.assignee_name || 'N/A'}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {tasks.length === 0 && (
                <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                    <p className="text-slate-400 font-medium italic">ยังไม่มีงานที่เสร็จสมบูรณ์เลยค่ะ สู้ ๆ นะค๊ะคุณปัน!</p>
                </div>
            )}
        </div>
    )
}