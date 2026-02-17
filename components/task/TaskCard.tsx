// components/task/TaskCard.tsx
import Link from 'next/link'
import NextImage from 'next/image'
import { Briefcase, Clock, AlertCircle } from 'lucide-react'
import { Task } from '@/types/task'

export const TaskCard = ({ task }: { task: Task }) => (
    <Link href={`/task/${task.id}`} className="group bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-lg shadow-slate-200/20 hover:shadow-blue-200/40 hover:-translate-y-1.5 transition-all flex flex-col h-full relative overflow-hidden">

        {/* แถบสีข้างการ์ดเล็กลง */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${task.priority === 'High' ? 'bg-red-500' :
                task.priority === 'Low' ? 'bg-slate-300' : 'bg-blue-500'
            }`} />

        <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-2 rounded-xl text-blue-500"><Briefcase size={16} /></div>

            <div className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest ${task.priority === 'High' ? 'bg-red-50 text-red-500' :
                    task.priority === 'Low' ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-500'
                }`}>
                {task.priority || 'Medium'}
            </div>
        </div>

        {task.image_url && (
            <div className="relative w-full h-32 mb-4 rounded-2xl overflow-hidden border border-slate-50">
                <NextImage src={task.image_url} alt={task.title} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
            </div>
        )}

        <div className="space-y-2 mb-6">
            <h3 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1 italic tracking-tighter">
                {task.title}
            </h3>

            {task.due_date && (
                <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={10} />
                    <span className="text-[9px] font-bold italic">
                        {new Date(task.due_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </span>
                </div>
            )}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white border-2 border-white shadow-md text-[10px]">
                    {task.assignee_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <span className="text-[10px] font-bold text-slate-500 line-clamp-1">{task.assignee_name || 'Unassigned'}</span>
            </div>

            {task.priority === 'High' && <AlertCircle size={16} className="text-red-500 animate-pulse" />}
        </div>
    </Link>
)