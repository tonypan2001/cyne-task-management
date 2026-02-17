'use client'

import { useState, ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import {
    Plus, UserPlus, Camera, X, Circle,
    Briefcase, Loader2, Calendar as CalendarIcon, Trash2
} from 'lucide-react'
import NextImage from 'next/image'
import { Project, TaskFormData } from '@/types/task'

interface TaskFormProps {
    initialData?: Partial<TaskFormData>;
    projects: Project[];
    onSubmit: (data: TaskFormData) => void;
    loading: boolean;
}

export const TaskForm = ({ initialData, projects, onSubmit, loading }: TaskFormProps) => {
    // --- States ---
    const [title, setTitle] = useState(initialData?.title || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [selectedProjectId, setSelectedProjectId] = useState(initialData?.selectedProjectId || '')
    const [assigneeName, setAssigneeName] = useState(initialData?.assigneeName || '')
    const [dueDate, setDueDate] = useState(initialData?.due_date || '')
    const [subTasks, setSubTasks] = useState<{ title: string }[]>(initialData?.subTasks || [])
    const [newSubTask, setNewSubTask] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    // --- Handlers ---
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
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

    const handleUpdateSubTask = (index: number, value: string) => {
        const updated = [...subTasks]
        updated[index].title = value
        setSubTasks(updated)
    }

    const handleRemoveSubTask = (index: number) => {
        setSubTasks(subTasks.filter((_, i) => i !== index))
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (!selectedProjectId) {
            alert('กรุณาเลือกโปรเจกต์ก่อนนะค๊ะคุณปัน')
            return
        }

        onSubmit({
            title,
            description,
            selectedProjectId,
            assigneeName,
            subTasks,
            imageFile,
            due_date: dueDate
        })
    }

    const handleKeyDownSubTask = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddSubTask()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-10 bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 animate-in fade-in duration-500">

            {/* 1. Project Selection */}
            <div className="space-y-5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                    <Briefcase size={14} className="text-blue-500" /> Project Selection
                </label>
                <div className="flex flex-wrap gap-3">
                    {projects.map(p => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedProjectId(p.id)}
                            className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedProjectId === p.id
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105'
                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-transparent'
                                }`}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Main Info & Deadline */}
            <div className="space-y-8 pt-10 border-t border-slate-50">
                <input
                    required
                    className="w-full text-4xl font-black border-none focus:ring-0 outline-none placeholder:text-slate-100 italic tracking-tighter"
                    placeholder="Task Title..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />

                <div className="flex flex-wrap gap-6">
                    {/* Deadline Picker */}
                    <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100/50 group hover:border-blue-200 transition-all">
                        <div className="bg-white p-2.5 rounded-xl shadow-sm text-blue-500">
                            <CalendarIcon size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Deadline</span>
                            <input
                                type="date"
                                className="bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Assignee Input */}
                    <div className="flex-1 min-w-[200px] flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100/50 group hover:border-blue-200 transition-all">
                        <div className="bg-white p-2.5 rounded-xl shadow-sm text-slate-400 group-hover:text-blue-500">
                            <UserPlus size={18} />
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Assignee</span>
                            <input
                                type="text"
                                placeholder="Assign to..."
                                className="bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-700 outline-none"
                                value={assigneeName}
                                onChange={e => setAssigneeName(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <textarea
                    className="w-full text-lg font-medium text-slate-400 border-none focus:ring-0 outline-none resize-none placeholder:text-slate-100 min-h-[100px]"
                    placeholder="Describe this asset or task details..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
            </div>

            {/* 3. Sub-tasks Management */}
            <div className="space-y-6 pt-10 border-t border-slate-50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Work Roadmap (Sub-tasks)</label>

                {/* Sub-tasks List (Editable) */}
                <div className="space-y-3">
                    {subTasks.map((st, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group hover:border-blue-100 transition-all">
                            <Circle size={16} className="text-blue-500 shrink-0" />
                            <input
                                className="flex-1 text-sm font-bold text-slate-600 border-none focus:ring-0 p-0 outline-none bg-transparent"
                                value={st.title}
                                onChange={(e) => handleUpdateSubTask(i, e.target.value)}
                                placeholder="Sub-task title..."
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveSubTask(i)}
                                className="text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add New Sub-task Input */}
                <div className="flex gap-3">
                    <input
                        className="flex-1 px-6 py-5 bg-slate-50 rounded-3xl border-none outline-none text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        placeholder="Next step... (Press Enter to add)"
                        value={newSubTask}
                        onChange={e => setNewSubTask(e.target.value)}
                        onKeyDown={handleKeyDownSubTask}
                    />
                    <button
                        type="button"
                        onClick={handleAddSubTask}
                        className="bg-slate-900 text-white px-8 rounded-3xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            {/* 4. Attachment & Submit */}
            <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex-1">
                    {previewUrl ? (
                        <div className="relative w-48 h-32 rounded-4xl overflow-hidden shadow-xl border border-white ring-4 ring-slate-50">
                            <NextImage src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                            <button
                                type="button"
                                onClick={() => { setPreviewUrl(null); setImageFile(null); }}
                                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-xl text-red-500 backdrop-blur-sm shadow-md"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-48 h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-4xl cursor-pointer hover:bg-slate-100 hover:border-blue-300 transition-all group">
                            <Camera size={24} className="text-slate-300 group-hover:text-blue-500 mb-2" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attach File</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-12 py-6 bg-blue-600 text-white font-black text-[12px] uppercase tracking-[0.3em] rounded-4xl flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-2xl shadow-blue-200 active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                    {loading ? 'Processing...' : 'Save & Publish Task'}
                </button>
            </div>
        </form>
    )
}

const CheckCircle2 = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
)