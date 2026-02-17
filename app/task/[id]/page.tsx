'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import NextImage from 'next/image'
import { ArrowLeft, Calendar, User, Briefcase, CheckCircle2, Edit3, Trash2 } from 'lucide-react'

// ✨ Import Components & Types
import { Task, SubTask, TaskComment } from '@/types/task'
import { PageHeader } from '@/components/shared/PageHeader'
import { TaskStatusCard } from '@/components/task/TaskStatusCard'
import { DiscussionBoard } from '@/components/task/DiscussionBoard'
import Link from 'next/link'

export default function TaskDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()

    const [task, setTask] = useState<Task | null>(null)
    const [subTasks, setSubTasks] = useState<SubTask[]>([])
    const [comments, setComments] = useState<TaskComment[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        if (!id) return
        try {
            const [tRes, stRes, cRes] = await Promise.all([
                supabase.from('tasks').select('*').eq('id', id).single(),
                supabase.from('sub_tasks').select('*').eq('task_id', id).order('created_at'),
                supabase.from('task_comments').select('*').eq('task_id', id).order('created_at', { ascending: false })
            ])

            if (tRes.data) setTask(tRes.data as Task)
            if (stRes.data) setSubTasks(stRes.data as SubTask[])
            if (cRes.data) setComments(cRes.data as TaskComment[])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [id, supabase])

    useEffect(() => { fetchData() }, [fetchData])

    const handleToggleSubTask = async (stId: string, currentStatus: boolean) => {
        await supabase.from('sub_tasks').update({ is_completed: !currentStatus }).eq('id', stId)
        setSubTasks(subTasks.map(st => st.id === stId ? { ...st, is_completed: !currentStatus } : st))
    }

    const handleSendMessage = async (content: string) => {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        const { data } = await supabase.from('task_comments').insert({
            task_id: id,
            user_id: userData.user.id,
            content
        }).select().single()

        if (data) setComments([data as TaskComment, ...comments])
    }

    const handleDeleteTask = async () => {
        // ใช้ confirm พื้นฐานไปก่อนเพื่อให้โค้ดไม่อ้วนนะคะ
        if (!confirm('คุณปันแน่ใจนะคะว่าจะลบงานชิ้นนี้? ข้อมูลจะหายไปถาวรเลยนะค๊ะ')) return

        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id)

            if (error) throw error

            // ลบเสร็จแล้วให้กลับไปหน้า Dashboard ค่ะ
            router.push('/')
            router.refresh()
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert('เกิดข้อผิดพลาดในการลบค่ะ: ' + err.message)
            }
        }
    }

    const progress = subTasks.length > 0
        ? Math.round((subTasks.filter(st => st.is_completed).length / subTasks.length) * 100)
        : (task?.is_completed ? 100 : 0)

    if (loading || !task) return <div className="p-20 text-center font-black text-slate-200 animate-pulse">LOADING DETAILS...</div>

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-10">
                {/* ปุ่ม Back ฝั่งซ้าย */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Board
                </button>

                {/* กลุ่มปุ่ม Action ฝั่งขวา */}
                <div className="flex gap-3">
                    {/* ปุ่มแก้ไข */}
                    <Link
                        href={`/edit/${id}`}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-bold text-xs shadow-sm"
                    >
                        <Edit3 size={16} />
                        Edit Task
                    </Link>

                    {/* ปุ่มลบ */}
                    <button
                        onClick={handleDeleteTask}
                        className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-bold text-xs shadow-sm"
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                </div>
            </div>

            <PageHeader
                title={task.title}
                subtitle={task.description || 'No description provided for this asset.'}
                icon={<Briefcase size={14} />}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12">
                {/* Left Column: Details & Sub-tasks */}
                <div className="lg:col-span-8 space-y-10">
                    {task.image_url && (
                        <div className="relative w-full h-[450px] rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50">
                            <NextImage src={task.image_url} alt="Cover" fill className="object-cover" unoptimized />
                        </div>
                    )}

                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl space-y-10">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-300 uppercase flex items-center gap-1"><User size={12} /> Assignee</span>
                                <p className="text-sm font-bold text-slate-700">{task.assignee_name}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-300 uppercase flex items-center gap-1"><Calendar size={12} /> Created At</span>
                                <p className="text-sm font-bold text-slate-700">{new Date(task.created_at).toLocaleDateString('th-TH')}</p>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-slate-50">
                            <h3 className="font-black text-slate-800 mb-6 italic flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-blue-500" /> Milestone Checkpoints
                            </h3>
                            <div className="space-y-3">
                                {subTasks.map(st => (
                                    <button
                                        key={st.id}
                                        onClick={() => handleToggleSubTask(st.id, st.is_completed)}
                                        className="w-full flex items-center gap-4 p-5 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-all group"
                                    >
                                        <div className={`transition-colors ${st.is_completed ? 'text-green-500' : 'text-slate-200 group-hover:text-blue-300'}`}>
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <span className={`text-sm font-bold ${st.is_completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                            {st.title}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Status & Discussion */}
                <div className="lg:col-span-4 space-y-10">
                    <TaskStatusCard
                        isCompleted={task.is_completed}
                        progress={progress}
                        onToggle={async () => {
                            await supabase.from('tasks').update({ is_completed: !task.is_completed }).eq('id', task.id)
                            setTask({ ...task, is_completed: !task.is_completed })
                        }}
                    />
                    <DiscussionBoard
                        comments={comments}
                        onSendMessage={handleSendMessage}
                        loading={false}
                    />
                </div>
            </div>
        </div>
    )
}