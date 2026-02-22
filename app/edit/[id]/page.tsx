'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Edit3, ArrowLeft, Loader2 } from 'lucide-react'
import { Project, TaskFormData, Task, SubTask } from '@/types/task'
import { TaskForm } from '@/components/task/TaskForm'
import { PageHeader } from '@/components/shared/PageHeader'
import { useToast } from '@/components/shared/ToastProvider'
import { ConfirmModal } from '@/components/shared/ConfirmModal'

export default function EditTaskPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()
    const { showToast } = useToast()

    // ✨ Workspace State
    const [workspaceId, setWorkspaceId] = useState<string | null>(null)

    const [projects, setProjects] = useState<Project[]>([])
    const [initialData, setInitialData] = useState<Partial<TaskFormData> | null>(null)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    // Modal States สำหรับการลบโปรเจกต์
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

    // --- 2. Fetch Data ---
    const fetchData = useCallback(async () => {
        if (!id || !workspaceId) return

        try {
            const [pRes, tRes, stRes] = await Promise.all([
                supabase.from('projects').select('id, name').eq('workspace_id', workspaceId).order('name'), // ✨ กรองโปรเจกต์
                supabase.from('tasks').select('*').eq('id', id).single(),
                supabase.from('sub_tasks').select('*').eq('task_id', id).order('created_at')
            ])

            if (pRes.data) setProjects(pRes.data as Project[])

            if (tRes.data) {
                const task = tRes.data as Task
                const subTasks = stRes.data as SubTask[]

                // 🔒 เช็คว่างานนี้อยู่ใน Workspace ปัจจุบันหรือไม่
                if (task.workspace_id && task.workspace_id !== workspaceId) {
                    showToast('Access Denied', 'error', 'งานนี้ไม่ได้อยู่ในพื้นที่ทำงานปัจจุบัน')
                    router.push('/')
                    return
                }

                setInitialData({
                    title: task.title,
                    description: task.description || '',
                    selectedProjectId: task.project_id || '',
                    assigneeName: task.assignee_name || '',
                    due_date: task.due_date || '',
                    priority: (task.priority as "High" | "Medium" | "Low") ?? 'Medium',
                    subTasks: subTasks.map(st => ({ title: st.title }))
                })
            }
        } catch (err) {
            console.error('Error fetching edit data:', err)
            showToast('Sync Error', 'error', 'ไม่สามารถโหลดข้อมูลรายละเอียดงานได้')
        } finally {
            setFetching(false)
        }
    }, [id, workspaceId, supabase, router, showToast])

    useEffect(() => {
        if (workspaceId) {
            fetchData()
        }
    }, [workspaceId, fetchData])

    // --- 3. Project Handlers ---
    const handleCreateProject = async (name: string) => {
        if (!workspaceId) return null
        try {
            const { data: userData } = await supabase.auth.getUser()
            if (!userData.user) return null

            const { data, error } = await supabase
                .from('projects')
                .insert({ name, user_id: userData.user.id, workspace_id: workspaceId }) // ✨ แนบ workspace
                .select()
                .single()

            if (error) {
                if (error.code === '23505') showToast('Duplicate Name', 'warning', 'ชื่อโปรเจกต์นี้มีอยู่แล้ว')
                return null
            }
            if (data) {
                setProjects(prev => [...prev, data as Project])
                showToast('Success', 'success', 'เพิ่มโปรเจกต์ใหม่เรียบร้อยแล้ว')
                return data.id
            }
        } catch (_) {
            if (_) showToast('Error', 'error', 'ไม่สามารถสร้างโปรเจกต์ได้')
        }
        return null
    }

    const handleDeleteProjectRequest = async (projectId: string) => {
        try {
            const { count, error } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', projectId)
            if (error) throw error
            if (count && count > 0) {
                showToast('Cannot Delete', 'warning', `โปรเจกต์นี้ยังมีงานค้างอยู่ ${count} รายการ`)
                return false
            }
            setProjectToDelete(projectId)
            setIsDeleteModalOpen(true)
            return false
        } catch (_) {
            if (_) showToast('Error', 'error', 'ไม่สามารถตรวจสอบข้อมูลได้')
            return false
        }
    }

    const confirmDeleteProject = async () => {
        if (!projectToDelete) return
        setIsDeletingProject(true)
        try {
            const { error } = await supabase.from('projects').delete().eq('id', projectToDelete)
            if (error) throw error
            setProjects(prev => prev.filter(p => p.id !== projectToDelete))
            showToast('Project Removed', 'success', 'ลบโปรเจกต์ออกจากระบบแล้ว')
            setIsDeleteModalOpen(false)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
            showToast('Delete Failed', 'error', msg)
        } finally {
            setIsDeletingProject(false)
            setProjectToDelete(null)
        }
    }

    // --- 4. Task Update Logic ---
    const handleUpdate = async (formData: TaskFormData) => {
        if (!workspaceId) return
        setLoading(true)

        try {
            const { error: taskError } = await supabase
                .from('tasks')
                .update({
                    title: formData.title,
                    description: formData.description,
                    project_id: formData.selectedProjectId,
                    assignee_name: formData.assigneeName,
                    due_date: formData.due_date,
                    priority: formData.priority
                })
                .eq('id', id)

            if (taskError) throw taskError

            // จัดการ Sub-tasks
            await supabase.from('sub_tasks').delete().eq('task_id', id)
            if (formData.subTasks.length > 0) {
                const { error: subError } = await supabase.from('sub_tasks').insert(
                    formData.subTasks.map(st => ({ task_id: id, title: st.title }))
                )
                if (subError) throw subError
            }

            showToast('Task Updated', 'success', 'บันทึกการแก้ไขงานสำเร็จแล้ว')
            router.push(`/task/${id}`)
            router.refresh()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
            showToast('Update Failed', 'error', msg)
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 gap-4">
            <Loader2 size={32} className="animate-spin text-blue-600" />
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
                subtitle="ปรับปรุงรายละเอียดงานในพื้นที่ทำงานนี้"
                icon={<Edit3 size={16} />}
            />

            {initialData && (
                <TaskForm
                    projects={projects}
                    initialData={initialData}
                    onSubmit={handleUpdate}
                    onAddProject={handleCreateProject} // ✨ ใส่ฟังก์ชันสร้างโปรเจกต์
                    onDeleteProject={handleDeleteProjectRequest} // ✨ ใส่ฟังก์ชันลบโปรเจกต์
                    loading={loading}
                />
            )}

            {/* 🛠️ Confirm Modal สำหรับการลบโปรเจกต์ */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteProject}
                isLoading={isDeletingProject}
                title="Remove Project?"
                description="โปรเจกต์นี้จะถูกลบออกจากระบบอย่างถาวร"
                confirmText="Yes, Remove it"
            />
        </div>
    )
}