'use client'

import { useMemo } from 'react'
import { Target, Flag, Circle, ChevronRight } from 'lucide-react'
import { Task, Project } from '@/types/task'
import Link from 'next/link'

interface MonthlyGoalsProps {
    tasks: Task[]
    projects: Project[]
    currentReferenceDate: Date
}

export const MonthlyGoals = ({ tasks, projects, currentReferenceDate }: MonthlyGoalsProps) => {

    const projectStats = useMemo(() => {
        const refMonth = currentReferenceDate.getMonth()
        const refYear = currentReferenceDate.getFullYear()

        return projects.map(project => {
            const projectTasksInMonth = tasks.filter(t => {
                if (!t.due_date || t.project_id !== project.id) return false
                const taskDate = new Date(t.due_date)
                return taskDate.getMonth() === refMonth && taskDate.getFullYear() === refYear
            })

            const total = projectTasksInMonth.length
            const completed = projectTasksInMonth.filter(t => t.is_completed).length
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0

            return {
                id: project.id,
                name: project.name,
                progress,
                hasTasks: total > 0,
                taskCount: total
            }
        })
    }, [tasks, projects, currentReferenceDate])

    const displayMonth = currentReferenceDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    return (
        <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-2xl shadow-slate-200/40 animate-in slide-in-from-top duration-700">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-orange-500 p-2.5 rounded-2xl text-white shadow-lg shadow-orange-100">
                        <Target size={18} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 italic tracking-tighter uppercase">Monthly Goals</h3>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{displayMonth}</p>
                    </div>
                </div>

                <div className="hidden md:block text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Projects</p>
                    <p className="text-xl font-black text-slate-800 italic">
                        {projectStats.filter(p => p.hasTasks).length} / {projects.length}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectStats.map((proj) => (
                    /* ✨ เปลี่ยนจาก div เป็น Link เพื่อให้กดไปหน้า Project Detail ได้ */
                    <Link
                        href={`/project/${proj.id}`}
                        key={proj.id}
                        className={`group p-5 rounded-4xl border transition-all duration-500 flex flex-col hover:-translate-y-1 ${!proj.hasTasks
                            ? 'bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed pointer-events-none'
                            : 'bg-white border-slate-50 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50 cursor-pointer'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                {!proj.hasTasks ? (
                                    <Circle size={12} className="text-slate-300" />
                                ) : (
                                    <div className="relative">
                                        <Flag size={12} className={proj.progress === 100 ? 'text-green-500' : 'text-blue-500'} />
                                        {/* Hover Icon Effect */}
                                        <ChevronRight size={10} className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-400" />
                                    </div>
                                )}
                                <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${!proj.hasTasks ? 'text-slate-400' : 'text-slate-700 group-hover:text-blue-600'
                                    }`}>
                                    {proj.name}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className={`block text-[10px] font-black ${!proj.hasTasks ? 'text-slate-300' : 'text-blue-600'}`}>
                                    {proj.hasTasks ? `${proj.progress}%` : 'EMPTY'}
                                </span>
                                {proj.hasTasks && (
                                    <span className="text-[8px] font-bold text-slate-300 uppercase italic">
                                        {proj.taskCount} Tasks
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-auto">
                            <div
                                className={`h-full transition-all duration-1000 ease-out rounded-full ${!proj.hasTasks ? 'bg-slate-200' : proj.progress === 100 ? 'bg-green-500' : 'bg-blue-600'
                                    }`}
                                style={{ width: `${proj.hasTasks ? proj.progress : 0}%` }}
                            />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}