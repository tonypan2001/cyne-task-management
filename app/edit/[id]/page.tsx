'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Edit3 } from 'lucide-react'
import { Project, TaskFormData } from '@/types/task'
import { TaskForm } from '@/components/task/TaskForm'
import { PageHeader } from '@/components/shared/PageHeader'

export default function EditTaskPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()
    const [projects, setProjects] = useState<Project[]>([])
    const [initialData, setInitialData] = useState<Partial<TaskFormData> | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchData = useCallback(async () => {
        const { data: pData } = await supabase.from('projects').select('id, name')
        const { data: tData } = await supabase.from('tasks').select('*').eq('id', id).single()
        const { data: stData } = await supabase.from('sub_tasks').select('*').eq('task_id', id)

        if (pData) setProjects(pData)
        if (tData) {
            setInitialData({
                title: tData.title,
                description: tData.description,
                selectedProjectId: tData.project_id,
                assigneeName: tData.assignee_name,
                due_date: tData.due_date,
                subTasks: stData || []
            })
        }
    }, [id, supabase])

    useEffect(() => { fetchData() }, [fetchData])

    const handleUpdate = async (formData: TaskFormData) => {
        setLoading(true)
        try {
            // 1. อัปเดตข้อมูล Task หลัก
            await supabase.from('tasks').update({
                title: formData.title,
                description: formData.description,
                project_id: formData.selectedProjectId,
                assignee_name: formData.assigneeName,
                due_date: formData.due_date
            }).eq('id', id)

            // 2. จัดการ Sub-tasks (วิธีง่ายที่สุดคือลบของเดิมแล้วลงใหม่เพื่อให้หัวข้ออัปเดตตรงกัน)
            await supabase.from('sub_tasks').delete().eq('task_id', id)
            if (formData.subTasks.length > 0) {
                await supabase.from('sub_tasks').insert(
                    formData.subTasks.map(st => ({ task_id: id, title: st.title }))
                )
            }

            router.push(`/task/${id}`)
            router.refresh()
        } finally {
            setLoading(false)
        }
    }

    if (!initialData) return <div className="p-20 text-center font-black animate-pulse">LOADING DATA...</div>

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            <PageHeader title="Edit Task" subtitle="ปรับปรุงรายละเอียดงานให้แม่นยำนะค๊ะ" icon={<Edit3 size={16} />} />
            <TaskForm projects={projects} initialData={initialData} onSubmit={handleUpdate} loading={loading} />
        </div>
    )
}