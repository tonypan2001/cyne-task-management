'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Layout, CheckCircle2, Loader2, ArrowLeft, Save } from 'lucide-react'

export default function EditTaskPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [assigneeName, setAssigneeName] = useState('')
    const [isCompleted, setIsCompleted] = useState(false)

    useEffect(() => {
        async function fetchTask() {
            const { data } = await supabase.from('tasks').select('*').eq('id', id).single()
            if (data) {
                setTitle(data.title)
                setDescription(data.description || '')
                setCategory(data.category || 'General')
                setAssigneeName(data.assignee_name || '')
                setIsCompleted(data.is_completed || false)
            }
            setLoading(false)
        }
        fetchTask()
    }, [id, supabase])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdating(true)

        const { error } = await supabase
            .from('tasks')
            .update({
                title,
                description,
                category,
                assignee_name: assigneeName,
                is_completed: isCompleted
            })
            .eq('id', id)

        if (!error) {
            router.push(`/task/${id}`)
            router.refresh()
        }
        setUpdating(false)
    }

    if (loading) return <div className="p-10 text-center text-slate-400">กำลังโหลดข้อมูลเดิมนะค๊ะ...</div>

    return (
        <div className="max-w-3xl mx-auto p-6">
            <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-all font-bold text-sm uppercase">
                <ArrowLeft size={18} /> ยกเลิกการแก้ไข
            </button>

            <form onSubmit={handleUpdate} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl space-y-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                        <Layout size={14} /> แก้ไขข้อมูลงาน
                    </label>
                    <input
                        required
                        className="w-full py-2 text-2xl font-bold border-b-2 border-slate-50 focus:border-blue-500 outline-none transition-all"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">หมวดหมู่</label>
                        <select
                            className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="General">General</option>
                            <option value="Work">Work</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Personal">Personal</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">ผู้รับผิดชอบ</label>
                        <input
                            className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700"
                            value={assigneeName}
                            onChange={(e) => setAssigneeName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-4xl border border-blue-100/50">
                    <button
                        type="button"
                        onClick={() => setIsCompleted(!isCompleted)}
                        className={`p-2 rounded-xl transition-all ${isCompleted ? 'bg-green-500 text-white' : 'bg-white text-slate-200 border border-slate-100'}`}
                    >
                        <CheckCircle2 size={24} />
                    </button>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-sm">ทำเครื่องหมายว่า &quot;เสร็จสมบูรณ์&quot;</span>
                        <span className="text-[10px] text-slate-400">งานนี้จะถูกย้ายไปที่หน้า Completed</span>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={updating}
                    className="w-full bg-slate-900 text-white font-black py-5 rounded-4xl flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                    {updating ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {updating ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
            </form>
        </div>
    )
}