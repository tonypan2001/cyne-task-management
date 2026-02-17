'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import NextImage from 'next/image'
import Link from 'next/link'
import {
    ArrowLeft, Calendar, CheckCircle2,
    Circle, MessageSquare, Send, Trash2, Clock, User, ShieldCheck, Edit3
} from 'lucide-react'

// --- Interfaces ---
interface SubTask {
    id: string
    title: string
    is_completed: boolean
}

interface TaskComment {
    id: string
    content: string
    created_at: string
    user_id: string
}

interface Task {
    id: string
    title: string
    description: string | null
    category: string | null
    image_url: string | null
    created_at: string
    user_id: string
    creator_name: string | null
    assignee_name: string | null
    is_completed: boolean
}

export default function TaskDetailPage() {
    const params = useParams()
    const id = params.id as string
    const router = useRouter()
    const supabase = createClient()

    const [task, setTask] = useState<Task | null>(null)
    const [subTasks, setSubTasks] = useState<SubTask[]>([])
    const [comments, setComments] = useState<TaskComment[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)

    const fetchData = useCallback(async () => {
        try {
            const [taskRes, subRes, commentRes] = await Promise.all([
                supabase.from('tasks').select('*').eq('id', id).single(),
                supabase.from('sub_tasks').select('*').eq('task_id', id).order('created_at', { ascending: true }),
                supabase.from('task_comments').select('*').eq('task_id', id).order('created_at', { ascending: true })
            ])

            if (taskRes.data) setTask(taskRes.data as Task)
            if (subRes.data) setSubTasks(subRes.data as SubTask[])
            if (commentRes.data) setComments(commentRes.data as TaskComment[])
        } catch (err) {
            console.error('Error fetching data:', err)
        } finally {
            setLoading(false)
        }
    }, [id, supabase])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleDeleteTask = async () => {
        if (!confirm('คุณปันแน่ใจนะคะว่าจะลบงานนี้? ข้อมูลจะหายไปถาวรเลยนะค๊ะ')) return
        const { error } = await supabase.from('tasks').delete().eq('id', id)
        if (!error) {
            router.push('/')
            router.refresh()
        }
    }

    const toggleSubTask = async (subId: string, currentState: boolean) => {
        const { error } = await supabase.from('sub_tasks').update({ is_completed: !currentState }).eq('id', subId)
        if (!error) setSubTasks(prev => prev.map(st => st.id === subId ? { ...st, is_completed: !currentState } : st))
    }

    const handleSendComment = async () => {
        if (!newComment.trim() || isSending) return
        setIsSending(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { error } = await supabase.from('task_comments').insert({ task_id: id, user_id: user.id, content: newComment.trim() })
        if (!error) {
            setNewComment('')
            fetchData()
        }
        setIsSending(false)
    }

    if (loading) return <div className="p-10 text-center font-medium text-slate-400 animate-pulse">กำลังดึงข้อมูล...</div>
    if (!task) return <div className="p-10 text-center text-red-500 font-bold">ไม่พบงานนี้ในระบบค่ะ</div>

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-all font-bold text-xs uppercase tracking-widest">
                    <ArrowLeft size={18} /> Back
                </button>
                <div className="flex gap-3">
                    <Link href={`/edit/${id}`} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-100 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-bold text-xs shadow-sm">
                        <Edit3 size={16} /> แก้ไขงาน
                    </Link>
                    <button onClick={handleDeleteTask} className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-bold text-xs shadow-sm">
                        <Trash2 size={16} /> ลบงาน
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/30">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <span className={`px-5 py-2 text-[10px] font-black rounded-full uppercase tracking-[0.2em] ${task.is_completed ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                {task.is_completed ? 'Completed' : task.category}
                            </span>
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="bg-slate-50 p-2 rounded-xl text-slate-400"><ShieldCheck size={16} /></div>
                                    <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-300 uppercase">Creator</span><span className="text-xs font-bold text-slate-600">{task.creator_name?.split('@')[0]}</span></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-50 p-2 rounded-xl text-blue-500"><User size={16} /></div>
                                    <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-300 uppercase">Assignee</span><span className="text-xs font-bold text-slate-600">{task.assignee_name || 'Unassigned'}</span></div>
                                </div>
                            </div>
                        </div>

                        <h1 className="text-4xl font-black text-slate-800 mb-6 leading-tight">{task.title}</h1>
                        <p className="text-slate-500 text-lg leading-relaxed mb-10 whitespace-pre-wrap">{task.description}</p>

                        {task.image_url && (
                            <div className="relative w-full h-[450px] rounded-[2.5rem] overflow-hidden shadow-inner border border-slate-50 bg-slate-50/50">
                                <NextImage src={task.image_url} alt={task.title} fill className="object-contain p-4" unoptimized />
                            </div>
                        )}
                    </div>

                    {/* Sub-tasks */}
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
                        <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800">
                            <CheckCircle2 className="text-blue-500" size={24} />
                            Execution Steps
                        </h2>
                        <div className="space-y-2">
                            {subTasks.map((st) => (
                                <button key={st.id} onClick={() => toggleSubTask(st.id, st.is_completed)} className="w-full flex items-center gap-4 p-5 rounded-[1.5rem] hover:bg-slate-50 transition-all text-left group border border-transparent hover:border-slate-50">
                                    {st.is_completed ? <CheckCircle2 className="text-green-500" size={24} /> : <Circle className="text-slate-200 group-hover:text-blue-400" size={24} />}
                                    <span className={`text-base font-semibold ${st.is_completed ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{st.title}</span>
                                </button>
                            ))}
                            {subTasks.length === 0 && <p className="text-center py-6 text-slate-300 italic text-sm">ไม่มีขั้นตอนการทำงานย่อย</p>}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Work Progress</h3>
                        <div className="text-6xl font-black mb-6">
                            {subTasks.length > 0 ? Math.round((subTasks.filter(s => s.is_completed).length / subTasks.length) * 100) : 0}
                            <span className="text-2xl text-blue-500 ml-1">%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div
                                className="bg-blue-500 h-full transition-all duration-1000 ease-out"
                                style={{ width: `${subTasks.length > 0 ? (subTasks.filter(s => s.is_completed).length / subTasks.length) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl flex flex-col h-[550px]">
                        <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2">
                            <MessageSquare size={18} className="text-blue-500" /> Discussion
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 scrollbar-hide">
                            {comments.map((c) => (
                                <div key={c.id} className="space-y-2 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2 font-black text-[9px] text-slate-300 uppercase">
                                        {c.user_id === task.user_id ? 'AUTHOR' : 'TEAM MEMBER'}
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-[1.5rem] rounded-tl-none border border-slate-100 shadow-sm">
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{c.content}</p>
                                        <div className="flex items-center gap-1 mt-3 text-[8px] text-slate-300 font-bold uppercase">
                                            <Clock size={10} /> {new Date(c.created_at).toLocaleTimeString('th-TH')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && <p className="text-center py-10 text-slate-200 text-xs italic tracking-wide">ยังไม่มีการพูดคุยในงานนี้</p>}
                        </div>
                        <div className="relative pt-2">
                            <input
                                type="text"
                                placeholder="พิมพ์ข้อความตอบกลับ..."
                                className="w-full pl-6 pr-14 py-5 bg-slate-50 border-none rounded-[1.5rem] outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs font-semibold"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                            />
                            <button
                                onClick={handleSendComment}
                                disabled={isSending || !newComment.trim()}
                                className="absolute right-3 top-[18px] p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:bg-slate-200 disabled:shadow-none"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}