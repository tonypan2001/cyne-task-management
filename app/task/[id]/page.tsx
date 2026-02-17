'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import NextImage from 'next/image'
import {
    ArrowLeft, Calendar, CheckCircle2,
    Circle, MessageSquare, Send, Trash2, Clock
} from 'lucide-react'

// กำหนด Types ให้ชัดเจนตามกฎ ESLint ค่ะ
interface SubTask {
    id: string
    title: string
    is_completed: boolean
}

interface Task {
    id: string
    title: string
    description: string | null
    category: string | null
    image_url: string | null
    created_at: string
}

export default function TaskDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()

    const [task, setTask] = useState<Task | null>(null)
    const [subTasks, setSubTasks] = useState<SubTask[]>([])

    // ✨ แก้ไข 1: ตั้งค่าเริ่มต้นเป็น true เพื่อไม่ต้องสั่ง set ใน effect ทันที
    const [loading, setLoading] = useState(true)
    const [comment, setComment] = useState('')

    // ✨ แก้ไข 2: ปรับปรุง fetchData ให้เสถียรขึ้น
    const fetchData = useCallback(async () => {
        try {
            // ดึงข้อมูลพร้อมกันเพื่อความรวดเร็ว (Parallel Fetching)
            const [taskResponse, subDataResponse] = await Promise.all([
                supabase.from('tasks').select('*').eq('id', id).single(),
                supabase.from('sub_tasks').select('*').eq('task_id', id).order('created_at', { ascending: true })
            ])

            if (taskResponse.data) setTask(taskResponse.data)
            if (subDataResponse.data) setSubTasks(subDataResponse.data)
        } catch (err) {
            console.error('Error fetching data:', err)
        } finally {
            setLoading(false) // สั่งหยุดโหลดเมื่อดึงข้อมูลเสร็จทั้งหมดแล้ว
        }
    }, [id, supabase])

    useEffect(() => {
        // ✨ แก้ไข 3: เรียกใช้งาน
        fetchData()
    }, [fetchData])

    // ฟังก์ชันสลับสถานะ Sub-task
    const toggleSubTask = async (subId: string, currentState: boolean) => {
        const { error } = await supabase
            .from('sub_tasks')
            .update({ is_completed: !currentState })
            .eq('id', subId)

        if (!error) {
            setSubTasks(subTasks.map(st => st.id === subId ? { ...st, is_completed: !currentState } : st))
        }
    }

    if (loading) return <div className="p-8">กำลังโหลดข้อมูลงานของคุณปันนะค๊ะ...</div>
    if (!task) return <div className="p-8 text-red-500">ไม่พบข้อมูลงานชิ้นนี้ค่ะ</div>

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Navigation & Actions */}
            <div className="flex items-center justify-between">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">กลับไปหน้า Dashboard</span>
                </button>
                <button className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Detail & Sub-tasks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-widest">
                                {task.category || 'ทั่วไป'}
                            </span>
                            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                <Calendar size={16} />
                                {new Date(task.created_at).toLocaleDateString('th-TH')}
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">{task.title}</h1>
                        <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">{task.description}</p>

                        {task.image_url && (
                            <div className="mt-8 relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200">
                                <NextImage src={task.image_url} alt={task.title} fill className="object-cover" unoptimized />
                            </div>
                        )}
                    </div>

                    {/* Sub-tasks Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/30">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                            <CheckCircle2 className="text-green-500" size={24} />
                            รายการขั้นตอนการทำงาน
                        </h2>
                        <div className="space-y-3">
                            {subTasks.map((st) => (
                                <button
                                    key={st.id}
                                    onClick={() => toggleSubTask(st.id, st.is_completed)}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all text-left group"
                                >
                                    {st.is_completed ? (
                                        <CheckCircle2 className="text-green-500 shrink-0" size={22} />
                                    ) : (
                                        <Circle className="text-slate-300 shrink-0 group-hover:text-blue-400" size={22} />
                                    )}
                                    <span className={`font-medium ${st.is_completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                        {st.title}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Comments & Stats */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-200/20">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Clock size={20} /> ความคืบหน้า
                        </h3>
                        <div className="text-4xl font-black mb-2">
                            {subTasks.length > 0
                                ? Math.round((subTasks.filter(s => s.is_completed).length / subTasks.length) * 100)
                                : 0}%
                        </div>
                        <p className="text-slate-400 text-sm">เสร็จสิ้นไปแล้ว {subTasks.filter(s => s.is_completed).length} จาก {subTasks.length} รายการ</p>
                    </div>

                    {/* Comment Section Placeholder */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/30 flex flex-col h-[500px]">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <MessageSquare size={20} /> บันทึกข้อความ
                        </h3>
                        <div className="flex-1 overflow-y-auto text-center py-10 text-slate-400">
                            {/* ช่องแสดง Comment จะอยู่ตรงนี้ค่ะ */}
                            <p className="text-sm">ยังไม่มีบันทึกข้อความ</p>
                        </div>
                        <div className="mt-4 relative">
                            <input
                                type="text"
                                placeholder="พิมพ์บันทึก..."
                                className="w-full pl-4 pr-12 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md">
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}