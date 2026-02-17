'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Plus } from 'lucide-react'
import { Project, TaskFormData } from '@/types/task'
import { TaskForm } from '@/components/task/TaskForm'
import { PageHeader } from '@/components/shared/PageHeader'

export default function CreateTaskPage() {
    const supabase = createClient()
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(false)

    const fetchProjects = useCallback(async () => {
        const { data } = await supabase.from('projects').select('id, name').order('name')
        if (data) setProjects(data as Project[])
    }, [supabase])

    useEffect(() => {
        fetchProjects()
    }, [fetchProjects])

    // ✨ ฟังก์ชันสร้างโปรเจกต์ (พร้อมดัก Error ชื่อซ้ำ)
    const handleCreateProject = async (name: string) => {
        try {
            const { data: userData } = await supabase.auth.getUser()
            if (!userData.user) return

            const { data, error } = await supabase
                .from('projects')
                .insert({ name, user_id: userData.user.id })
                .select()
                .single()

            if (error) {
                if (error.code === '23505') { // Postgres error code สำหรับ Unique violation
                    alert('ชื่อโปรเจกต์นี้มีอยู่แล้วนะค๊ะคุณปัน ลองใช้ชื่ออื่นดูค่ะ')
                } else {
                    throw error
                }
                return null
            }

            if (data) {
                setProjects(prev => [...prev, data as Project])
                return data.id
            }
        } catch (err) {
            console.error(err)
            return null
        }
    }

    // ✨ ฟังก์ชันลบโปรเจกต์
    const handleDeleteProject = async (projectId: string) => {
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId)

            if (error) throw error

            // อัปเดต UI ทันที
            setProjects(prev => prev.filter(p => p.id !== projectId))
            return true
        } catch (err) {
            alert(`ไม่สามารถลบโปรเจกต์ได้ อาจจะมีงานค้างอยู่ในโปรเจกต์นี้นะค๊ะ ${err}`)
            return false
        }
    }

    const handleCreateTask = async (formData: TaskFormData) => {
        setLoading(true)
        try {
            const { data: userData } = await supabase.auth.getUser()
            const user = userData.user
            if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนนะค๊ะ')

            let imageUrl = ''
            if (formData.imageFile) {
                const fileName = `${user.id}/${Date.now()}.${formData.imageFile.name.split('.').pop()}`
                await supabase.storage.from('task-images').upload(fileName, formData.imageFile)
                imageUrl = supabase.storage.from('task-images').getPublicUrl(fileName).data.publicUrl
            }

            const { data: task, error: taskError } = await supabase
                .from('tasks')
                .insert({
                    title: formData.title,
                    description: formData.description,
                    image_url: imageUrl,
                    user_id: user.id,
                    project_id: formData.selectedProjectId,
                    creator_name: user.email,
                    assignee_name: formData.assigneeName || 'Unassigned',
                    due_date: formData.due_date
                }).select().single()

            if (taskError) throw taskError

            if (formData.subTasks.length > 0 && task) {
                await supabase.from('sub_tasks').insert(
                    formData.subTasks.map(st => ({ task_id: task.id, title: st.title }))
                )
            }

            router.push('/')
            router.refresh()
        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 animate-in fade-in duration-500">
            <PageHeader
                title="Create Task"
                subtitle="เพิ่มงานใหม่เข้าสู่โปรเจกต์ของคุณปันนะค๊ะ"
                icon={<Plus size={16} />}
            />
            <TaskForm
                projects={projects}
                onSubmit={handleCreateTask}
                onAddProject={handleCreateProject}
                onDeleteProject={handleDeleteProject} // ✨ ส่งฟังก์ชันลบลงไปค่ะ
                loading={loading}
            />
        </div>
    )
}