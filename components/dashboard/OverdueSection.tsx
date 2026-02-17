'use client'

import { AlertCircle } from 'lucide-react'
import { Task, Project } from '@/types/task'
import { TaskCard } from '@/components/task/TaskCard'

interface OverdueSectionProps {
    tasks: Task[]
    projects: Project[]
}

export const OverdueSection = ({ tasks, projects }: OverdueSectionProps) => {
    if (tasks.length === 0) return null;

    return (
        <div className="space-y-6 animate-in slide-in-from-left duration-700">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-xl text-orange-600 animate-pulse">
                        <AlertCircle size={18} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter">
                            Overdue Tasks
                        </h3>
                        <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest">
                            งานที่ยังค้างอยู่จากวันก่อนค่ะ
                        </p>
                    </div>
                </div>
                <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-orange-100">
                    {tasks.length} PENDING
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                    <div key={task.id} className="relative group">
                        <TaskCard task={task} projects={projects} />
                        {/* ป้ายเตือนเล็กๆ มุมการ์ด */}
                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-md rotate-12 group-hover:rotate-0 transition-transform">
                            LATE
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-b border-slate-100 pb-4" />
        </div>
    )
}