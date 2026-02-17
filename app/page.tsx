'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import NextImage from 'next/image'
import { Calendar, CheckCircle2, Clock } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string | null
  category: string | null
  image_url: string | null
  created_at: string
}

export default function DashboardPage() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error && data) setTasks(data)
      setLoading(false)
    }
    fetchTasks()
  }, [supabase])

  if (loading) return <div className="flex items-center justify-center h-full">กำลังโหลดข้อมูล...</div>

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">ยินดีต้อนรับกลับมาค่ะ! วันนี้มีงานอะไรต้องทำบ้างคะ?</p>
      </header>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-slate-300" size={40} />
          </div>
          <h3 className="text-xl font-semibold text-slate-700">ไม่มีงานค้างเลยค่ะ</h3>
          <p className="text-slate-400 mt-2">พักผ่อนให้เต็มที่ หรือเริ่มสร้างงานใหม่ได้เลยนะค๊ะ!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-blue-100 transition-all group"
            >
              {/* Task Image */}
              {task.image_url && (
                <div className="relative w-full h-40">
                  <NextImage src={task.image_url} alt={task.title} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {task.category}
                  </span>
                  <div className="text-slate-300 flex items-center gap-1 text-xs">
                    <Calendar size={12} />
                    {new Date(task.created_at).toLocaleDateString('th-TH')}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{task.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mt-1">{task.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Clock size={14} />
                    <span>รอคอย</span>
                  </div>
                  <button className="text-blue-500 hover:text-blue-700 text-xs font-bold">ดูรายละเอียด →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}