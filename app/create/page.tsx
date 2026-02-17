'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import NextImage from 'next/image'
import {
    Camera, Send, Loader2, X, Plus,
    CheckCircle2, Circle, Layout, ListTodo, AlignLeft, Briefcase, User, PenTool
} from 'lucide-react'

export default function CreateTaskPage() {
    const supabase = createClient()
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('General')

    // ระบบ Sub-tasks
    const [subTasks, setSubTasks] = useState<{ title: string }[]>([])
    const [newSubTask, setNewSubTask] = useState('')

    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl(null)
            return
        }
        const url = URL.createObjectURL(imageFile)
        setPreviewUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [imageFile])

    const addSubTask = () => {
        if (newSubTask.trim()) {
            setSubTasks([...subTasks, { title: newSubTask.trim() }])
            setNewSubTask('')
        }
    }

    const removeSubTask = (index: number) => {
        setSubTasks(subTasks.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนนะคะ')

            let imageUrl = ''
            if (imageFile) {
                const fileName = `${user.id}/${Date.now()}.${imageFile.name.split('.').pop()}`
                const { error: uploadError } = await supabase.storage.from('task-images').upload(fileName, imageFile)
                if (uploadError) throw uploadError
                const { data: urlData } = supabase.storage.from('task-images').getPublicUrl(fileName)
                imageUrl = urlData.publicUrl
            }

            // 1. บันทึก Task หลัก
            const { data: mainTask, error: taskError } = await supabase
                .from('tasks')
                .insert({ title, description, category, image_url: imageUrl, user_id: user.id })
                .select()
                .single()

            if (taskError) throw taskError

            // 2. บันทึก Sub-tasks (ถ้ามี)
            if (subTasks.length > 0) {
                const subTasksToInsert = subTasks.map(st => ({
                    task_id: mainTask.id,
                    title: st.title
                }))
                const { error: subError } = await supabase.from('sub_tasks').insert(subTasksToInsert)
                if (subError) throw subError
            }

            router.push('/')
            router.refresh()
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดค่ะ')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 md:p-10 text-slate-800">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Layout className="text-blue-600" size={32} />
                    สร้างงานใหม่
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">

                {/* หัวข้อหลัก */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <AlignLeft size={18} />
                        <span className="text-sm font-semibold uppercase tracking-wider">ข้อมูลพื้นฐาน</span>
                    </div>
                    <input
                        required
                        className="w-full px-0 py-2 text-xl font-medium border-b-2 border-slate-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                        placeholder="หัวข้อการทำงาน..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        className="w-full px-0 py-2 text-slate-600 border-none focus:ring-0 outline-none resize-none placeholder:text-slate-300"
                        placeholder="เพิ่มคำอธิบาย..."
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* หมวดหมู่ */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">หมวดหมู่</label>
                        <div className="relative">
                            <select
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border-none outline-none appearance-none font-medium text-slate-700"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="General">ทั่วไป</option>
                                <option value="Work">งานประจำ</option>
                                <option value="Freelance">ฟรีแลนซ์</option>
                                <option value="Personal">ส่วนตัว</option>
                            </select>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                {category === 'Work' && <Briefcase size={18} />}
                                {category === 'Personal' && <User size={18} />}
                                {category === 'Freelance' && <PenTool size={18} />}
                                {category === 'General' && <Layout size={18} />}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">รูปภาพ</label>
                        <label className="flex items-center justify-center gap-2 bg-slate-50 py-2.5 rounded-xl border border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 transition-all">
                            <Camera size={18} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-600">{imageFile ? 'เปลี่ยนรูป' : 'แนบรูป'}</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                        </label>
                    </div>
                </div>

                {/* ระบบ Sub-tasks */}
                <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-500">
                        <ListTodo size={18} />
                        <span className="text-sm font-semibold uppercase tracking-wider">รายการย่อย (Sub-tasks)</span>
                    </div>

                    <div className="space-y-2">
                        {subTasks.map((st, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group">
                                <Circle size={18} className="text-slate-300" />
                                <span className="flex-1 text-sm text-slate-700">{st.title}</span>
                                <button type="button" onClick={() => removeSubTask(index)} className="text-slate-300 hover:text-red-500 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400"
                            placeholder="เพิ่มขั้นตอนการทำงาน..."
                            value={newSubTask}
                            onChange={(e) => setNewSubTask(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubTask())}
                        />
                        <button
                            type="button"
                            onClick={addSubTask}
                            className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Image Preview */}
                {previewUrl && (
                    <div className="relative w-full h-40 rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                        <NextImage src={previewUrl} alt="Preview" fill className="object-contain p-2" unoptimized />
                        <button type="button" onClick={() => setImageFile(null)} className="absolute top-2 right-2 bg-black/20 backdrop-blur-md text-white p-1.5 rounded-full hover:bg-red-500 transition-all">
                            <X size={14} />
                        </button>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                    {loading ? 'กำลังบันทึกข้อมูล...' : 'บันทึกงานทั้งหมด'}
                </button>
            </form>
        </div>
    )
}