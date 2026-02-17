import { TaskStatusCardProps } from '@/types/task'
import { CheckCircle2, Circle } from 'lucide-react'

export const TaskStatusCard = ({ isCompleted, progress, onToggle }: TaskStatusCardProps) => (
    <div className="bg-slate-900 text-white rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
        <div className="relative z-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Current Status</h3>
            <div className="flex items-end justify-between mb-8">
                <div className="text-6xl font-black italic tracking-tighter">
                    {progress}<span className="text-2xl text-blue-500 ml-1">%</span>
                </div>
                <button
                    onClick={onToggle}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isCompleted ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-white hover:text-slate-900'
                        }`}
                >
                    {isCompleted ? 'Completed' : 'Mark as Done'}
                </button>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                    className="bg-blue-500 h-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
        <div className="absolute -right-10 -bottom-10 text-slate-800/50 group-hover:text-blue-500/10 transition-colors">
            {isCompleted ? <CheckCircle2 size={200} /> : <Circle size={200} />}
        </div>
    </div>
)