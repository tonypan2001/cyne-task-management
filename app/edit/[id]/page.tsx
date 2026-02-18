'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Edit3, ArrowLeft } from 'lucide-react'
import { Project, TaskFormData, Task, SubTask } from '@/types/task'
import { TaskForm } from '@/components/task/TaskForm'
import { PageHeader } from '@/components/shared/PageHeader'

export default function EditTaskPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()

    const [projects, setProjects] = useState<Project[]>([])
    const [initialData, setInitialData] = useState<Partial<TaskFormData> | null>(null)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    const fetchData = useCallback(async () => {
        if (!id) return
        try {
            const [pRes, tRes, stRes] = await Promise.all([
                supabase.from('projects').select('id, name').order('name'),
                supabase.from('tasks').select('*').eq('id', id).single(),
                supabase.from('sub_tasks').select('*').eq('task_id', id).order('created_at')
            ])

            if (pRes.data) setProjects(pRes.data as Project[])

            if (tRes.data) {
                const task = tRes.data as Task
                const subTasks = stRes.data as SubTask[]

                // ✨ Mapping ข้อมูลเดิมเข้าสู่รูปแบบที่ TaskForm ต้องการ
                setInitialData({
                    title: task.title,
                    description: task.description || '',
                    selectedProjectId: task.project_id || '',
                    assigneeName: task.assignee_name || '',
                    due_date: task.due_date || '', // 📅 ดึงวันที่เดิมมาใส่ตรงนี้ค่ะ
                    priority: (task.priority as "High" | "Medium" | "Low") ?? 'Medium',
                    subTasks: subTasks.map(st => ({ title: st.title }))
                })
            }
        } catch (err) {
            console.error('Error fetching edit data:', err)
        } finally {
            setFetching(false)
        }
    }, [id, supabase])

    useEffect(() => { fetchData() }, [fetchData])

    const handleUpdate = async (formData: TaskFormData) => {
        setLoading(true)
        try {
            // 1. อัปเดตข้อมูล Task หลัก
            const { error: taskError } = await supabase
                .from('tasks')
                .update({
                    title: formData.title,
                    description: formData.description,
                    project_id: formData.selectedProjectId,
                    assignee_name: formData.assigneeName,
                    due_date: formData.due_date, // 💾 บันทึกวันที่ใหม่ (หรือวันเดิม) ลงไปค่ะ
                    priority: formData.priority
                })
                .eq('id', id)

            if (taskError) throw taskError

            // 2. จัดการ Sub-tasks (ลบของเก่าแล้วเพิ่มใหม่เพื่อให้ข้อมูลตรงกับหน้าฟอร์มที่สุด)
            await supabase.from('sub_tasks').delete().eq('task_id', id)

            if (formData.subTasks.length > 0) {
                const { error: subError } = await supabase.from('sub_tasks').insert(
                    formData.subTasks.map(st => ({ task_id: id, title: st.title }))
                )
                if (subError) throw subError
            }

            router.push(`/task/${id}`)
            router.refresh()
        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="font-black text-[10px] uppercase tracking-widest">Loading Task Data...</p>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 animate-in fade-in duration-500">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-10 hover:text-blue-600 transition-colors"
            >
                <ArrowLeft size={16} /> Cancel Editing
            </button>

            <PageHeader
                title="Edit Task"
                subtitle="ปรับปรุงรายละเอียดและกำหนดส่งให้แม่นยำนะค๊ะ"
                icon={<Edit3 size={16} />}
            />

            {initialData && (
                <TaskForm
                    projects={projects}
                    initialData={initialData}
                    onSubmit={handleUpdate}
                    loading={loading}
                />
            )}
        </div>
    )
}