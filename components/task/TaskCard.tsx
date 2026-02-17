// components/task/TaskCard.tsx
import Link from 'next/link'
import NextImage from 'next/image'
import { Briefcase, Clock, AlertCircle } from 'lucide-react'
import { Task } from '@/types/task'

export const TaskCard = ({ task }: { task: Task }) => (
    <Link href={`/task/${task.id}`} className="group bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-blue-200/40 hover:-translate-y-2 transition-all flex flex-col h-full relative overflow-hidden">

        {/* ✨ เพิ่มแถบสีข้างการ์ดตาม Priority */}
        <div className={`absolute left-0 top-0 bottom-0 w-2 ${task.priority === 'High' ? 'bg-red-500' :
                task.priority === 'Low' ? 'bg-slate-300' : 'bg-blue-500'
            }`} />

        <div className="flex justify-between items-start mb-6">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-500"><Briefcase size={20} /></div>

            {/* ✨ Priority Tag */}
            <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${task.priority === 'High' ? 'bg-red-50 text-red-500' :
                    task.priority === 'Low' ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-500'
                }`}>
                {task.priority || 'Medium'}
            </div>
        </div>

        {task.image_url && (
            <div className="relative w-full h-44 mb-6 rounded-4xl overflow-hidden border border-slate-50">
                <NextImage src={task.image_url} alt={task.title} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
            </div>
        )}

        <div className="space-y-3 mb-8">
            <h3 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 italic tracking-tighter">
                {task.title}
            </h3>

            {/* ✨ แสดง Deadline เล็กๆ บน Card */}
            {task.due_date && (
                <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold italic">
                        {new Date(task.due_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </span>
                </div>
            )}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-white border-2 border-white shadow-lg text-xs">
                    {task.assignee_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-300 uppercase">Owner</span>
                    <span className="text-xs font-bold text-slate-600">{task.assignee_name || 'Unassigned'}</span>
                </div>
            </div>

            {/* ✨ ถ้าเป็นงานด่วน (High) ให้มีไอคอนเตือน */}
            {task.priority === 'High' && <AlertCircle size={20} className="text-red-500 animate-pulse" />}
        </div>
    </Link>
)