'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import NextImage from 'next/image'
import {
    ArrowLeft, Calendar, CheckCircle2,
    Circle, MessageSquare, Send, Trash2, Clock, User
} from 'lucide-react'

// --- 1. กำหนด Interfaces ---
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
    assigned_to: string | null
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

    // --- 2. ฟังก์ชันดึงข้อมูล (Fetch) ---
    const fetchData = useCallback(async () => {
        try {
            const [taskRes, subRes, commentRes] = await Promise.all([
                supabase.from('tasks').select('*').eq('id', id).single(),
                supabase.from('sub_tasks').select('*').eq('task_id', id).order('created_at', { ascending: true }),
                supabase.from('task_comments').select('*').eq('task_id', id).order('created_at', { ascending: true })
            ])

            if (taskRes.data) setTask(taskRes.data)
            if (subRes.data) setSubTasks(subRes.data)
            if (commentRes.data) setComments(commentRes.data)
        } catch (err) {
            console.error('Error fetching task details:', err)
        } finally {
            setLoading(false)
        }
    }, [id, supabase])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // --- 3. ฟังก์ชันจัดการ Sub-tasks ---
    const toggleSubTask = async (subId: string, currentState: boolean) => {
        const { error } = await supabase
            .from('sub_tasks')
            .update({ is_completed: !currentState })
            .eq('id', subId)

        if (!error) {
            setSubTasks(prev => prev.map(st => st.id === subId ? { ...st, is_completed: !currentState } : st))
        }
    }

    // --- 4. ฟังก์ชันจัดการ Comment ---
    const handleSendComment = async () => {
        if (!newComment.trim() || isSending) return
        setIsSending(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนนะคะ')

            const { error } = await supabase.from('task_comments').insert({
                task_id: id,
                user_id: user.id,
                content: newComment.trim()
            })

            if (error) throw error
            setNewComment('')
            fetchData() // โหลดข้อมูลใหม่เพื่อแสดงคอมเมนต์ล่าสุด
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งค่ะ')
        } finally {
            setIsSending(false)
        }
    }

    if (loading) return <div className="p-10 text-center font-medium text-slate-500">กำลังดึงข้อมูลงานของคุณปันนะค๊ะ...</div>
    if (!task) return <div className="p-10 text-center text-red-500">ไม่พบข้อมูลงานชิ้นนี้ค่ะ</div>

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-medium">
                    <ArrowLeft size={20} />
                    กลับไปหน้า Dashboard
                </button>
                <div className="flex gap-2">
                    <button className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* คอลัมน์ซ้าย: ข้อมูลงาน & Sub-tasks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/30">
                        <div className="flex flex-wrap gap-3 mb-6 items-center">
                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
                                {task.category || 'GENERAL'}
                            </span>
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                                <Calendar size={14} />
                                {new Date(task.created_at).toLocaleDateString('th-TH')}
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-slate-800 mb-4">{task.title}</h1>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap mb-8">{task.description}</p>

                        {task.image_url && (
                            <div className="relative w-full h-[400px] rounded-4xl overflow-hidden border border-slate-50">
                                <NextImage src={task.image_url} alt={task.title} fill className="object-cover" unoptimized />
                            </div>
                        )}
                    </div>

                    {/* Sub-tasks */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/20">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                            <CheckCircle2 className="text-green-500" size={20} />
                            ขั้นตอนการทำงาน
                        </h2>
                        <div className="space-y-2">
                            {subTasks.map((st) => (
                                <button
                                    key={st.id}
                                    onClick={() => toggleSubTask(st.id, st.is_completed)}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all text-left group"
                                >
                                    {st.is_completed ? (
                                        <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                                    ) : (
                                        <Circle className="text-slate-200 shrink-0 group-hover:text-blue-400" size={20} />
                                    )}
                                    <span className={`text-sm font-medium ${st.is_completed ? 'text-slate-300 line-through' : 'text-slate-600'}`}>
                                        {st.title}
                                    </span>
                                </button>
                            ))}
                            {subTasks.length === 0 && <p className="text-slate-400 text-sm text-center py-4 italic">ไม่มีรายการย่อย</p>}
                        </div>
                    </div>
                </div>

                {/* คอลัมน์ขวา: สถิติ & คอมเมนต์ */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl">
                        <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-4">ความคืบหน้า</h3>
                        <div className="text-5xl font-black mb-4">
                            {subTasks.length > 0 ? Math.round((subTasks.filter(s => s.is_completed).length / subTasks.length) * 100) : 0}%
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-blue-500 h-full transition-all duration-500"
                                style={{ width: `${subTasks.length > 0 ? (subTasks.filter(s => s.is_completed).length / subTasks.length) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col h-[500px]">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <MessageSquare size={18} className="text-blue-500" />
                            คอมเมนต์
                        </h3>

                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-hide">
                            {comments.map((c) => (
                                <div key={c.id} className="group">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="bg-slate-100 p-1 rounded-md">
                                            <User size={10} className="text-slate-400" />
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                            {c.user_id === task.user_id ? 'OWNER' : 'GUEST'}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100">
                                        <p className="text-xs text-slate-600 leading-relaxed">{c.content}</p>
                                        <div className="text-[8px] text-slate-300 mt-2 flex items-center gap-1 uppercase">
                                            <Clock size={8} /> {new Date(c.created_at).toLocaleTimeString('th-TH')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && <p className="text-slate-300 text-[10px] text-center py-10 italic">ยังไม่มีคอมเมนต์ค่ะ</p>}
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="พิมพ์ข้อความ..."
                                className="w-full pl-5 pr-12 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                            />
                            <button
                                onClick={handleSendComment}
                                disabled={isSending || !newComment.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:bg-slate-100 disabled:text-slate-300"
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