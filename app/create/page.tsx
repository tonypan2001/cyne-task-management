'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import NextImage from 'next/image'
import {
    Plus, UserPlus, Camera, Loader2, X,
    CheckCircle2, Circle, FolderPlus, Briefcase
} from 'lucide-react'

// --- 1. กำหนด Interface ให้ชัดเจน (No any) ---
interface Project {
    id: string
    name: string
}

interface SubTaskInput {
    title: string
}

export default function CreateTaskPage() {
    const supabase = createClient()
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [projects, setProjects] = useState<Project[]>([])

    // Form States
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [selectedProjectId, setSelectedProjectId] = useState('')
    const [assigneeName, setAssigneeName] = useState('')
    const [subTasks, setSubTasks] = useState<SubTaskInput[]>([])
    const [newSubTask, setNewSubTask] = useState('')

    // Project Creation States
    const [isAddingProject, setIsAddingProject] = useState(false)
    const [newProjectName, setNewProjectName] = useState('')

    // Image States
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    // --- 2. แก้ไข useEffect และ fetchProjects ด้วย useCallback ---
    const fetchProjects = useCallback(async () => {
        const { data } = await supabase.from('projects').select('id, name').order('name')
        if (data) setProjects(data as Project[])
    }, [supabase])

    useEffect(() => {
        fetchProjects()
    }, [fetchProjects]) // ✨ เพิ่ม fetchProjects เข้ามาตามกฎ ESLint ค่ะ

    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl(null)
            return
        }
        const url = URL.createObjectURL(imageFile)
        setPreviewUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [imageFile])

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return
        const { data: userData } = await supabase.auth.getUser()
        const user = userData.user
        if (!user) return

        const { data, error } = await supabase
            .from('projects')
            .insert({ name: newProjectName.trim(), user_id: user.id })
            .select().single()

        if (!error && data) {
            setProjects(prev => [...prev, data as Project])
            setSelectedProjectId(data.id)
            setNewProjectName('')
            setIsAddingProject(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProjectId) return alert('กรุณาเลือกหรือสร้างโปรเจกต์ก่อนนะค๊ะ')
        setLoading(true)

        try {
            const { data: userData } = await supabase.auth.getUser()
            const user = userData.user
            if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนค่ะ')

            let imageUrl = ''
            if (imageFile) {
                const fileName = `${user.id}/${Date.now()}.${imageFile.name.split('.').pop()}`
                await supabase.storage.from('task-images').upload(fileName, imageFile)
                imageUrl = supabase.storage.from('task-images').getPublicUrl(fileName).data.publicUrl
            }

            const { data: task, error: taskError } = await supabase
                .from('tasks')
                .insert({
                    title,
                    description,
                    image_url: imageUrl,
                    user_id: user.id,
                    project_id: selectedProjectId,
                    creator_name: user.email,
                    assignee_name: assigneeName || 'Unassigned'
                }).select().single()

            if (taskError) throw taskError

            if (subTasks.length > 0 && task) {
                await supabase.from('sub_tasks').insert(
                    subTasks.map(st => ({ task_id: task.id, title: st.title }))
                )
            }

            router.push('/')
            router.refresh()
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-2xl text-white shadow-lg shadow-blue-100"><Plus size={24} /></div>
                Create New Task
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Briefcase size={14} /> Select Project
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {projects.map(p => (
                            <button key={p.id} type="button" onClick={() => setSelectedProjectId(p.id)}
                                className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all ${selectedProjectId === p.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                                {p.name}
                            </button>
                        ))}
                        <button type="button" onClick={() => setIsAddingProject(true)} className="px-6 py-3 rounded-2xl text-xs font-bold bg-slate-900 text-white flex items-center gap-2 hover:bg-blue-700 transition-all">
                            <FolderPlus size={14} /> New Project
                        </button>
                    </div>

                    {isAddingProject && (
                        <div className="flex gap-2 mt-4 animate-in slide-in-from-top-2">
                            <input type="text" placeholder="Project name..." value={newProjectName} onChange={e => setNewProjectName(e.target.value)}
                                className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold" />
                            <button type="button" onClick={handleCreateProject} className="bg-blue-600 text-white px-6 rounded-2xl font-bold text-xs">Create</button>
                            <button type="button" onClick={() => setIsAddingProject(false)} className="bg-slate-100 text-slate-400 px-4 rounded-2xl hover:bg-red-50 hover:text-red-500"><X size={18} /></button>
                        </div>
                    )}
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-50">
                    <input required className="w-full text-3xl font-black border-none focus:ring-0 outline-none placeholder:text-slate-200"
                        placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} />
                    <textarea className="w-full text-lg font-medium text-slate-500 border-none focus:ring-0 outline-none resize-none placeholder:text-slate-200"
                        placeholder="Add some details..." rows={2} value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assignee</label>
                        <div className="relative">
                            <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input type="text" placeholder="Who's working on this?" value={assigneeName} onChange={e => setAssigneeName(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 text-sm" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Step list (Sub-tasks)</label>
                        <div className="flex gap-2">
                            <input className="flex-1 px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold"
                                placeholder="Next step..." value={newSubTask} onChange={e => setNewSubTask(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (newSubTask.trim()) {
                                            setSubTasks([...subTasks, { title: newSubTask.trim() }]);
                                            setNewSubTask('');
                                        }
                                    }
                                }} />
                            <button type="button" onClick={() => {
                                if (newSubTask.trim()) {
                                    setSubTasks([...subTasks, { title: newSubTask.trim() }]);
                                    setNewSubTask('');
                                }
                            }}
                                className="bg-slate-900 text-white px-5 rounded-2xl"><Plus size={20} /></button>
                        </div>
                    </div>
                </div>

                {subTasks.length > 0 && (
                    <div className="space-y-2 bg-slate-50/50 p-4 rounded-3xl">
                        {subTasks.map((st, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100">
                                <Circle size={14} className="text-slate-300" />
                                <span className="flex-1 text-sm font-bold text-slate-600">{st.title}</span>
                                <button type="button" onClick={() => setSubTasks(subTasks.filter((_, idx) => idx !== i))}><X size={14} className="text-slate-300" /></button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-6 border-t border-slate-50">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 block">Attachment</label>
                    {previewUrl ? (
                        <div className="relative w-full h-64 rounded-3xl overflow-hidden border border-slate-100">
                            <NextImage src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                            <button type="button" onClick={() => setImageFile(null)} className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md text-red-500 rounded-xl shadow-lg"><X size={18} /></button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center h-32 bg-slate-50 border-2 border-dashed border-slate-100 rounded-3xl cursor-pointer hover:bg-slate-100 transition-all">
                            <Camera size={24} className="text-slate-300 mb-2" />
                            <span className="text-xs font-bold text-slate-400">Add Image</span>
                            <input type="file" className="hidden" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                        </label>
                    )}
                </div>

                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-blue-200">
                    {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
                    {loading ? 'Saving Task...' : 'Confirm & Create Task'}
                </button>
            </form>
        </div>
    )
}