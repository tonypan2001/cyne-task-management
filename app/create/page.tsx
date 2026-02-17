'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import NextImage from 'next/image'
import { 
  Layout, AlignLeft, Briefcase, User, PenTool, 
  Camera, Send, Loader2, X, Plus, ListTodo, 
  CheckCircle2, Circle, UserPlus 
} from 'lucide-react'

export default function CreateTaskPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [assigneeName, setAssigneeName] = useState('')
  
  // ระบบ Sub-tasks
  const [subTasks, setSubTasks] = useState<{ title: string }[]>([])
  const [newSubTask, setNewSubTask] = useState('')

  // ระบบรูปภาพ
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
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('กรุณาเข้าสู่ระบบก่อนสร้างงานนะค๊ะ')

      let imageUrl = ''
      if (imageFile) {
        const fileName = `${user.id}/${Date.now()}.${imageFile.name.split('.').pop()}`
        const { error: uploadError } = await supabase.storage.from('task-images').upload(fileName, imageFile)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('task-images').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }

      // 1. บันทึก Task หลัก พร้อมข้อมูลผู้สร้างและผู้รับผิดชอบ
      const { data: mainTask, error: taskError } = await supabase
        .from('tasks')
        .insert({ 
          title, 
          description, 
          category, 
          image_url: imageUrl, 
          user_id: user.id,
          creator_name: user.email, // ใช้ email เป็นชื่อผู้สร้างเบื้องต้น
          assignee_name: assigneeName || 'ยังไม่มอบหมาย'
        })
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
    <div className="max-w-3xl mx-auto p-6 md:p-10 text-slate-800">
      <div className="mb-10">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-100">
            <Plus size={28} />
          </div>
          สร้างงานใหม่
        </h1>
        <p className="text-slate-400 mt-2 ml-1">กรอกรายละเอียดเพื่อมอบหมายและจัดการงานอย่างเป็นระบบ</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
        
        {/* หัวข้อและคำอธิบาย */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-slate-400">
            <AlignLeft size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">ข้อมูลงาน</span>
          </div>
          <input
            required
            className="w-full px-0 py-2 text-2xl font-bold border-b-2 border-slate-50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-200"
            placeholder="ระบุหัวข้อการทำงาน..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full px-0 py-2 text-slate-600 border-none focus:ring-0 outline-none resize-none placeholder:text-slate-300 text-lg"
            placeholder="เพิ่มคำอธิบายรายละเอียดงาน (ไม่บังคับ)..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
          {/* หมวดหมู่ */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">หมวดหมู่</label>
            <div className="relative">
              <select 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none appearance-none font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/10"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="General">ทั่วไป</option>
                <option value="Work">งานประจำ</option>
                <option value="Freelance">ฟรีแลนซ์</option>
                <option value="Personal">ส่วนตัว</option>
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                {category === 'Work' && <Briefcase size={20} />}
                {category === 'Personal' && <User size={20} />}
                {category === 'Freelance' && <PenTool size={20} />}
                {category === 'General' && <Layout size={20} />}
              </div>
            </div>
          </div>

          {/* มอบหมายงาน */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">มอบหมายงานให้</label>
            <div className="relative">
              <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="text"
                placeholder="ชื่อผู้รับผิดชอบ..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-300"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ระบบ Sub-tasks */}
        <div className="space-y-5 pt-6 border-t border-slate-50">
          <div className="flex items-center gap-2 text-slate-400">
            <ListTodo size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">รายการขั้นตอน (Sub-tasks)</span>
          </div>
          
          <div className="space-y-3">
            {subTasks.map((st, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-50 group transition-all hover:bg-white hover:shadow-md">
                <Circle size={18} className="text-slate-200" />
                <span className="flex-1 text-sm font-medium text-slate-600">{st.title}</span>
                <button type="button" onClick={() => removeSubTask(index)} className="text-slate-300 hover:text-red-500 transition-colors">
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-300"
              placeholder="เช่น ออกแบบร่างแรก, ส่งตรวจงาน..."
              value={newSubTask}
              onChange={(e) => setNewSubTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubTask())}
            />
            <button 
              type="button" 
              onClick={addSubTask}
              className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        {/* รูปภาพประกอบ */}
        <div className="space-y-5 pt-6 border-t border-slate-50">
          <div className="flex items-center gap-2 text-slate-400">
            <Camera size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">รูปภาพประกอบ</span>
          </div>
          
          {!previewUrl ? (
            <label className="flex flex-col items-center justify-center gap-3 bg-slate-50 py-10 rounded-[2rem] border-2 border-dashed border-slate-200 cursor-pointer hover:bg-slate-100 hover:border-blue-300 transition-all group">
              <div className="bg-white p-4 rounded-2xl shadow-sm text-slate-400 group-hover:text-blue-500 transition-colors">
                <Camera size={32} />
              </div>
              <span className="text-sm font-bold text-slate-400">คลิกเพื่อเลือกรูปภาพ</span>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </label>
          ) : (
            <div className="relative w-full h-64 rounded-[2rem] overflow-hidden shadow-xl border border-slate-100">
              <NextImage src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
              <button 
                type="button" 
                onClick={() => setImageFile(null)} 
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-red-500 p-2 rounded-xl shadow-lg hover:bg-red-50 transition-all"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {/* ปุ่ม Submit */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-black text-lg py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
            {loading ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันการสร้างงาน'}
          </button>
        </div>
      </form>
    </div>
  )
}