'use client'

import { useMemo } from 'react'
import { Target, Flag, Circle } from 'lucide-react'
import { Task, Project } from '@/types/task'

interface MonthlyGoalsProps {
    tasks: Task[]
    projects: Project[]
}

export const MonthlyGoals = ({ tasks, projects }: MonthlyGoalsProps) => {
    // ✨ คำนวณความคืบหน้าของแต่ละโปรเจกต์
    const projectStats = useMemo(() => {
        return projects.map(project => {
            const projectTasks = tasks.filter(t => t.project_id === project.id)
            const total = projectTasks.length
            const completed = projectTasks.filter(t => t.is_completed).length
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0

            return {
                id: project.id,
                name: project.name,
                progress,
                hasTasks: total > 0
            }
        })
    }, [tasks, projects])

    // ดึงชื่อเดือนปัจจุบัน
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    return (
        <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-2xl shadow-slate-200/40 animate-in slide-in-from-top duration-700">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-orange-500 p-2.5 rounded-2xl text-white shadow-lg shadow-orange-100">
                        <Target size={18} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 italic tracking-tighter uppercase">Monthly Goals</h3>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{currentMonth}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectStats.map((proj) => (
                    <div key={proj.id} className={`group p-5 rounded-4xl border transition-all duration-500 ${!proj.hasTasks
                            ? 'bg-slate-50 border-slate-100 opacity-60'
                            : 'bg-white border-slate-50 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50'
                        }`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                {!proj.hasTasks ? (
                                    <Circle size={12} className="text-slate-300" />
                                ) : (
                                    <Flag size={12} className={proj.progress === 100 ? 'text-green-500' : 'text-blue-500'} />
                                )}
                                <span className={`text-[11px] font-black uppercase tracking-tight ${!proj.hasTasks ? 'text-slate-400' : 'text-slate-700'}`}>
                                    {proj.name}
                                </span>
                            </div>
                            <span className={`text-[10px] font-black ${!proj.hasTasks ? 'text-slate-300' : 'text-blue-600'}`}>
                                {proj.hasTasks ? `${proj.progress}%` : 'NO TASKS'}
                            </span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            {/* Actual Progress */}
                            <div
                                className={`h-full transition-all duration-1000 ease-out rounded-full ${!proj.hasTasks ? 'bg-slate-200' : proj.progress === 100 ? 'bg-green-500' : 'bg-blue-600'
                                    }`}
                                style={{ width: `${proj.hasTasks ? proj.progress : 0}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}