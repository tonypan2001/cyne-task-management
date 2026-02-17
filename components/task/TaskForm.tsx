'use client'

import { useState } from 'react'
import { Plus, UserPlus, Camera, X, Circle, Briefcase, FolderPlus } from 'lucide-react'
import NextImage from 'next/image'
import { Project, SubTask } from '@/types/task'

interface TaskFormProps {
    initialData?: any;
    projects: Project[];
    onSubmit: (data: any) => void;
    loading: boolean;
}

export const TaskForm = ({ initialData, projects, onSubmit, loading }: TaskFormProps) => {
    const [title, setTitle] = useState(initialData?.title || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [selectedProjectId, setSelectedProjectId] = useState(initialData?.project_id || '')
    const [assigneeName, setAssigneeName] = useState(initialData?.assignee_name || '')
    const [subTasks, setSubTasks] = useState<{ title: string }[]>(initialData?.subTasks || [])
    const [newSubTask, setNewSubTask] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url || null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({ title, description, selectedProjectId, assigneeName, subTasks, imageFile })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl">
            {/* Project Selection */}
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
                </div>
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sub-tasks</label>
                    <div className="flex gap-2">
                        <input className="flex-1 px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold"
                            placeholder="Next step..." value={newSubTask} onChange={e => setNewSubTask(e.target.value)} />
                        <button type="button" onClick={() => { if (newSubTask) setSubTasks([...subTasks, { title: newSubTask }]); setNewSubTask('') }} className="bg-slate-900 text-white px-5 rounded-2xl"><Plus size={20} /></button>
                    </div>
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] hover:bg-slate-900 transition-all shadow-xl">
                {loading ? 'Processing...' : 'Save Task'}
            </button>
        </form>
    )
}