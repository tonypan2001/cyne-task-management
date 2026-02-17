import Link from 'next/link'
import NextImage from 'next/image'
import { Calendar, Briefcase, Clock } from 'lucide-react'
import { Task } from '@/types/task'

export const TaskCard = ({ task }: { task: Task }) => (
  <Link href={`/task/${task.id}`} className="group bg-white rounded-[3rem] p-8 border border-slate-50 shadow-xl shadow-slate-200/20 hover:shadow-blue-200/40 hover:-translate-y-2 transition-all flex flex-col h-full relative overflow-hidden">
    <div className="flex justify-between items-start mb-6">
      <div className="bg-blue-50 p-3 rounded-2xl text-blue-500"><Briefcase size={20}/></div>
      <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter flex items-center gap-1">
        <Calendar size={12}/>{new Date(task.created_at).toLocaleDateString('th-TH')}
      </span>
    </div>
    
    {task.image_url && (
      <div className="relative w-full h-40 mb-4 rounded-2xl overflow-hidden">
        <NextImage src={task.image_url} alt={task.title} fill className="object-cover" unoptimized />
      </div>
    )}

    <h3 className="text-2xl font-black text-slate-800 mb-6 group-hover:text-blue-600 transition-colors line-clamp-2 italic">{task.title}</h3>
    
    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 border border-white text-xs">
          {task.assignee_name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-slate-300 uppercase">Assigned to</span>
          <span className="text-xs font-bold text-slate-600">{task.assignee_name || 'Unassigned'}</span>
        </div>
      </div>
      <div className="text-slate-100 group-hover:text-blue-200 transition-colors"><Clock size={20}/></div>
    </div>
  </Link>
)