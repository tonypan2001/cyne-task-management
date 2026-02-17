'use client'

import { useState } from 'react'
import { Plus, UserPlus, Camera, X, Circle, Briefcase, Loader2 } from 'lucide-react'
import NextImage from 'next/image'
import { Project, TaskFormData } from '@/types/task'

interface TaskFormProps {
    initialData?: Partial<TaskFormData>;
    projects: Project[];
    onSubmit: (data: TaskFormData) => void;
    loading: boolean;
}

export const TaskForm = ({ initialData, projects, onSubmit, loading }: TaskFormProps) => {
    const [title, setTitle] = useState(initialData?.title || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [selectedProjectId, setSelectedProjectId] = useState(initialData?.selectedProjectId || '')
    const [assigneeName, setAssigneeName] = useState(initialData?.assigneeName || '')
    const [subTasks, setSubTasks] = useState<{ title: string }[]>(initialData?.subTasks || [])
    const [newSubTask, setNewSubTask] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleAddSubTask = () => {
        if (newSubTask.trim()) {
            setSubTasks([...subTasks, { title: newSubTask.trim() }])
            setNewSubTask('')
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProjectId) return alert('กรุณาเลือกโปรเจกต์ก่อนนะค๊ะ')

        onSubmit({
            title,
            description,
            selectedProjectId,
            assigneeName,
            subTasks,
            imageFile
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
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
                        <input type="text" placeholder="Assign to..." value={assigneeName} onChange={e => setAssigneeName(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 text-sm" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sub-tasks</label>
                    <div className="flex gap-2">
                        <input className="flex-1 px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold"
                            placeholder="Next step..." value={newSubTask} onChange={e => setNewSubTask(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubTask())} />
                        <button type="button" onClick={handleAddSubTask} className="bg-slate-900 text-white px-5 rounded-2xl"><Plus size={20} /></button>
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
                {previewUrl ? (
                    <div className="relative w-64 h-40 rounded-3xl overflow-hidden shadow-lg border border-slate-100">
                        <NextImage src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                        <button type="button" onClick={() => { setPreviewUrl(null); setImageFile(null); }} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-xl text-red-500"><X size={16} /></button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-64 h-32 bg-slate-50 border-2 border-dashed border-slate-100 rounded-3xl cursor-pointer hover:bg-slate-100 transition-all">
                        <Camera size={24} className="text-slate-300 mb-2" />
                        <span className="text-[10px] font-black text-slate-400 uppercase">Add Attachment</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                )}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-5 rounded-4xl flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-blue-200">
                {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                {loading ? 'PROCESSING...' : 'CONFIRM & CREATE TASK'}
            </button>
        </form>
    )
}