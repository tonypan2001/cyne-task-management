'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import NextImage from 'next/image'
import Link from 'next/link'
import {
    ArrowLeft, Calendar, User, Briefcase,
    CheckCircle2, Trash2, Edit3, Clock, AlertCircle,
    Loader2
} from 'lucide-react'

// ✨ Import Components & Types
import { Task, SubTask, TaskComment } from '@/types/task'
import { PageHeader } from '@/components/shared/PageHeader'
import { TaskStatusCard } from '@/components/task/TaskStatusCard'
import { DiscussionBoard } from '@/components/task/DiscussionBoard'
import { useAdmin } from '@/hook/useAdmin'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { useToast } from '@/components/shared/ToastProvider'

export default function TaskDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()
    const { showToast } = useToast()

    // ✨ Workspace State
    const [workspaceId, setWorkspaceId] = useState<string | null>(null)

    // ✨ Modal & Loading States
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isStatusLoading, setIsStatusLoading] = useState(false)

    const { isAdmin, loading: adminLoading } = useAdmin()

    const [task, setTask] = useState<Task | null>(null)
    const [subTasks, setSubTasks] = useState<SubTask[]>([])
    const [comments, setComments] = useState<TaskComment[]>([])
    const [loading, setLoading] = useState(true)

    // --- 1. ตรวจสอบ Workspace เริ่มต้น ---
    useEffect(() => {
        const activeId = localStorage.getItem('active_workspace_id')
        if (!activeId) {
            router.push('/workspaces')
            return
        }
        setWorkspaceId(activeId)
    }, [router])

    // --- 2. Fetch Data ---
    const fetchData = useCallback(async () => {
        if (!id || !workspaceId) return // ✨ รอให้ได้ Workspace ก่อนถึงจะโหลด

        try {
            const [tRes, stRes, cRes] = await Promise.all([
                supabase.from('tasks').select('*').eq('id', id).single(),
                supabase.from('sub_tasks').select('*').eq('task_id', id).order('created_at'),
                supabase.from('task_comments').select('*').eq('task_id', id).order('created_at', { ascending: false })
            ])

            if (tRes.data) {
                const fetchedTask = tRes.data as Task

                // 🔒 เช็คความปลอดภัย: งานนี้อยู่ใน Workspace นี้จริงๆ ใช่ไหม?
                if (fetchedTask.workspace_id !== workspaceId) {
                    showToast('Access Denied', 'error', 'งานนี้ไม่ได้อยู่ในพื้นที่ทำงานปัจจุบัน')
                    router.push('/')
                    return
                }

                setTask(fetchedTask)
            }

            if (stRes.data) setSubTasks(stRes.data as SubTask[])
            if (cRes.data) setComments(cRes.data as TaskComment[])
        } catch (err) {
            console.error('Error fetching task details:', err)
            showToast('Sync Error', 'error', 'ไม่สามารถโหลดข้อมูลรายละเอียดงานได้')
        } finally {
            setLoading(false)
        }
    }, [id, workspaceId, supabase, showToast, router])

    useEffect(() => {
        if (workspaceId) {
            fetchData()
        }
    }, [workspaceId, fetchData])

    // --- 3. Handlers ---
    const handleDeleteTask = async () => {
        setIsDeleting(true)
        try {
            const { error } = await supabase.from('tasks').delete().eq('id', id)
            if (error) throw error

            setIsModalOpen(false)
            showToast('Task Deleted', 'success', 'ลบงานออกจากระบบเรียบร้อยแล้ว')

            router.push('/')
            router.refresh()
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error occurred'
            showToast('Delete Failed', 'error', message)
            setIsDeleting(false)
        }
    }

    const handleToggleSubTask = async (stId: string, currentStatus: boolean) => {
        try {
            await supabase.from('sub_tasks').update({ is_completed: !currentStatus }).eq('id', stId)
            setSubTasks(subTasks.map(st => st.id === stId ? { ...st, is_completed: !currentStatus } : st))
            showToast('Checkpoint Updated', 'success')
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            showToast('Operation Failed', 'error', errorMessage);
        }
    }

    const handleSendMessage = async (content: string) => {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return
        try {
            const { data, error } = await supabase.from('task_comments').insert({
                task_id: id, user_id: userData.user.id, content
            }).select().single()

            if (error) throw error
            if (data) {
                setComments([data as TaskComment, ...comments])
                showToast('Comment Sent', 'success', 'ส่งข้อความสำเร็จแล้ว')
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            showToast('Operation Failed', 'error', errorMessage);
        }
    }

    // --- 4. Deadline Logic ---
    const getDeadlineStatus = (dateStr: string | null) => {
        if (!dateStr) return { label: 'No Deadline', color: 'text-slate-400', bg: 'bg-slate-50' }

        const [year, month, day] = dateStr.split('-').map(Number)
        const deadline = new Date(year, month - 1, day)
        deadline.setHours(0, 0, 0, 0)

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays < 0) return { label: `Overdue ${Math.abs(diffDays)}d`, color: 'text-red-500', bg: 'bg-red-50' }
        if (diffDays === 0) return { label: 'Due Today', color: 'text-orange-500', bg: 'bg-orange-50' }
        return { label: `In ${diffDays} days`, color: 'text-blue-500', bg: 'bg-blue-50' }
    }

    const progress = subTasks.length > 0
        ? Math.round((subTasks.filter(st => st.is_completed).length / subTasks.length) * 100)
        : (task?.is_completed ? 100 : 0)

    if (loading || !task) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 gap-4">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="font-black text-[10px] uppercase tracking-widest">Loading Details...</p>
        </div>
    )

    const dlStatus = getDeadlineStatus(task.due_date)

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">

            {/* Action Bar */}
            <div className="flex items-center justify-between mb-10">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors">
                    <ArrowLeft size={16} /> Back to Board
                </button>

                {!adminLoading && isAdmin && (
                    <div className="flex gap-3">
                        <Link href={`/edit/${id}`} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-bold text-xs shadow-sm shadow-slate-200/50">
                            <Edit3 size={16} /> Edit Task
                        </Link>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-bold text-xs shadow-sm"
                        >
                            <Trash2 size={16} /> Delete
                        </button>
                    </div>
                )}
            </div>

            <PageHeader
                title={task.title}
                subtitle={task.description || 'ไม่มีคำอธิบายสำหรับงานชิ้นนี้'}
                icon={<Briefcase size={14} />}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12">
                <div className="lg:col-span-8 space-y-10">
                    {task.image_url && (
                        <div className="relative w-full h-[450px] rounded-[3.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-white">
                            <NextImage src={task.image_url} alt="Cover" fill className="object-cover" unoptimized />
                        </div>
                    )}

                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl space-y-10">
                        {/* Meta Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-300 uppercase flex items-center gap-1"><User size={12} /> Assignee</span>
                                <p className="text-sm font-bold text-slate-700 italic">{task.assignee_name || 'Unassigned'}</p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-300 uppercase flex items-center gap-1"><Clock size={12} /> Deadline</span>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-bold text-slate-700">
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'}
                                    </p>
                                    {task.due_date && (
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-md w-fit uppercase ${dlStatus.bg} ${dlStatus.color}`}>
                                            {dlStatus.label}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-300 uppercase flex items-center gap-1"><Calendar size={12} /> Created</span>
                                <p className="text-sm font-bold text-slate-700">{new Date(task.created_at).toLocaleDateString('th-TH')}</p>
                            </div>
                        </div>

                        {/* Sub-tasks Section */}
                        <div className="pt-10 border-t border-slate-50">
                            <h3 className="font-black text-slate-800 mb-6 italic flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-blue-500" /> Milestone Checkpoints
                            </h3>
                            <div className="space-y-3">
                                {subTasks.map(st => (
                                    <button key={st.id} onClick={() => handleToggleSubTask(st.id, st.is_completed)}
                                        className="w-full flex items-center gap-4 p-5 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-all group border border-transparent hover:border-blue-100/50">
                                        <div className={`transition-all ${st.is_completed ? 'text-green-500 scale-110' : 'text-slate-200 group-hover:text-blue-300'}`}>
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <span className={`text-sm font-bold ${st.is_completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                            {st.title}
                                        </span>
                                    </button>
                                ))}
                                {subTasks.length === 0 && (
                                    <div className="flex items-center gap-2 p-6 bg-slate-50 rounded-2xl text-slate-300 italic text-xs">
                                        <AlertCircle size={14} /> ไม่มีรายการขั้นตอนย่อยในงานนี้
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-10">
                    <TaskStatusCard
                        isCompleted={task.is_completed}
                        progress={progress}
                        onToggle={async () => {
                            try {
                                setIsStatusLoading(true)
                                const newStatus = !task.is_completed
                                const { error } = await supabase.from('tasks').update({ is_completed: newStatus }).eq('id', task.id)

                                if (error) throw error

                                setTask({ ...task, is_completed: newStatus })
                                showToast('Status Changed', 'success', `เปลี่ยนสถานะเป็น ${newStatus ? 'เสร็จสิ้น' : 'กำลังดำเนินการ'} แล้ว`)
                                router.refresh()
                            } catch (err: unknown) {
                                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                                showToast('Operation Failed', 'error', errorMessage);
                            } finally {
                                setIsStatusLoading(false)
                            }
                        }}
                        isLoading={isStatusLoading}
                    />
                    <DiscussionBoard
                        comments={comments}
                        onSendMessage={handleSendMessage}
                        loading={false}
                    />
                </div>
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDeleteTask}
                isLoading={isDeleting}
                title="Confirm Deletion?"
                description={`งานชิ้นนี้จะถูกลบออกจากระบบถาวร\nแน่ใจแล้วนะว่าต้องการดำเนินการต่อ?`}
                confirmText="Yes, Delete it"
            />
        </div>
    )
}