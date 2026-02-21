'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Plus, Loader2 } from 'lucide-react'
import { Project, TaskFormData } from '@/types/task'
import { TaskForm } from '@/components/task/TaskForm'
import { PageHeader } from '@/components/shared/PageHeader'
import { useToast } from '@/components/shared/ToastProvider'
import { ConfirmModal } from '@/components/shared/ConfirmModal'

export default function CreateTaskPage() {
    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()
    
    // ✨ เพิ่ม State สำหรับเก็บ Workspace ID ปัจจุบัน
    const [workspaceId, setWorkspaceId] = useState<string | null>(null)
    const [isPageLoading, setIsPageLoading] = useState(true)

    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(false)

    // States สำหรับจัดการ Modal การลบโปรเจกต์
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
    const [isDeletingProject, setIsDeletingProject] = useState(false)

    // --- 1. ตรวจสอบ Workspace เริ่มต้น ---
    useEffect(() => {
        const activeId = localStorage.getItem('active_workspace_id')
        if (!activeId) {
            router.push('/workspaces')
            return
        }
        setWorkspaceId(activeId)
    }, [router])

    // --- 2. Fetch Projects (เฉพาะของ Workspace นี้) ---
    const fetchProjects = useCallback(async () => {
        if (!workspaceId) return
        
        try {
            const { data } = await supabase
                .from('projects')
                .select('id, name')
                .eq('workspace_id', workspaceId) // ✨ กรองเฉพาะโปรเจกต์ของ Workspace นี้
                .order('name')
            
            if (data) setProjects(data as Project[])
        } catch (_) {
            if (_) showToast('Sync Error', 'error', 'ไม่สามารถโหลดข้อมูลโปรเจกต์ได้ค๊ะ')
        } finally {
            setIsPageLoading(false)
        }
    }, [supabase, workspaceId, showToast])

    useEffect(() => {
        if (workspaceId) {
            fetchProjects()
        }
    }, [workspaceId, fetchProjects])

    // --- 3. สร้าง Project (แนบ Workspace ID) ---
    const handleCreateProject = async (name: string) => {
        if (!workspaceId) {
            showToast('Error', 'error', 'ไม่พบข้อมูล Workspace ปัจจุบันค๊ะ')
            return null
        }

        try {
            const { data: userData } = await supabase.auth.getUser()
            if (!userData.user) return null

            const { data, error } = await supabase
                .from('projects')
                .insert({ 
                    name, 
                    user_id: userData.user.id,
                    workspace_id: workspaceId // ✨ แนบ Workspace ID ลง Database
                })
                .select()
                .single()

            if (error) {
                if (error.code === '23505') {
                    showToast('Duplicate Name', 'warning', 'ชื่อโปรเจกต์นี้มีอยู่แล้วในพื้นที่ทำงานนี้ค่ะ')
                } else {
                    throw error
                }
                return null
            }

            if (data) {
                setProjects(prev => [...prev, data as Project])
                showToast('Success', 'success', 'เพิ่มโปรเจกต์ใหม่เรียบร้อยแล้วค่ะ')
                return data.id
            }
            return null
        } catch (_) {
            if (_) showToast('Error', 'error', 'ไม่สามารถสร้างโปรเจกต์ได้ในขณะนี้ค๊ะ')
            return null
        }
    }

    // --- 4. Logic การจัดการลบโปรเจกต์ (เหมือนเดิม) ---
    const handleDeleteProjectRequest = async (projectId: string) => {
        try {
            const { count, error } = await supabase
                .from('tasks')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', projectId)

            if (error) throw error

            if (count && count > 0) {
                showToast('Cannot Delete', 'warning', `โปรเจกต์นี้ยังมีงานค้างอยู่ ${count} รายการค๊ะ`)
                return false
            }

            setProjectToDelete(projectId)
            setIsDeleteModalOpen(true)
            return false 
        } catch (_) {
            if (_) showToast('Error', 'error', 'ไม่สามารถตรวจสอบข้อมูลได้ค๊ะ')
            return false
        }
    }

    const confirmDeleteProject = async () => {
        if (!projectToDelete) return

        setIsDeletingProject(true)
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectToDelete)

            if (error) throw error

            setProjects(prev => prev.filter(p => p.id !== projectToDelete))
            showToast('Project Removed', 'success', 'ลบโปรเจกต์ออกจากระบบแล้วค่ะ')
            setIsDeleteModalOpen(false)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดค๊ะ'
            showToast('Delete Failed', 'error', msg)
        } finally {
            setIsDeletingProject(false)
            setProjectToDelete(null)
        }
    }

    // --- 5. สร้าง Task (แนบ Workspace ID) ---
    const handleCreateTask = async (formData: TaskFormData) => {
        if (!workspaceId) return

        setLoading(true)
        try {
            const { data: userData } = await supabase.auth.getUser()
            const user = userData.user
            if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนดำเนินการนะค๊ะ')

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
                    workspace_id: workspaceId, // ✨ แนบ Workspace ID ลง Database
                    project_id: formData.selectedProjectId,
                    creator_name: user.email,
                    assignee_name: formData.assigneeName || 'Unassigned',
                    due_date: formData.due_date,
                    priority: formData.priority || 'Medium'
                }).select().single()

            if (taskError) throw taskError

            if (formData.subTasks.length > 0 && task) {
                await supabase.from('sub_tasks').insert(
                    formData.subTasks.map(st => ({ task_id: task.id, title: st.title }))
                )
            }

            showToast('Task Created', 'success', 'สร้างงานใหม่เข้าสู่ระบบสำเร็จแล้วค๊ะ')
            router.push('/')
            router.refresh()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดค๊ะ'
            showToast('Creation Failed', 'error', msg)
        } finally {
            setLoading(false)
        }
    }

    if (isPageLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 gap-4">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <p className="font-black uppercase tracking-widest text-[10px] italic">Loading Workspace...</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 animate-in fade-in duration-700">
            <PageHeader
                title="Create Task"
                subtitle="เพิ่มงานใหม่เข้าสู่พื้นที่ทำงานปัจจุบันของคุณค๊ะ"
                icon={<Plus size={16} />}
            />

            <TaskForm
                projects={projects}
                onSubmit={handleCreateTask}
                onAddProject={handleCreateProject}
                onDeleteProject={handleDeleteProjectRequest}
                loading={loading}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteProject}
                isLoading={isDeletingProject}
                title="Remove Project?"
                description="โปรเจกต์นี้จะถูกลบออกจากระบบอย่างถาวรค๊ะ"
                confirmText="Yes, Remove it"
            />
        </div>
    )
}