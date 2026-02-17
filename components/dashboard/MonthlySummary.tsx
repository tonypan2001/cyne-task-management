'use client'

import { useMemo } from 'react'
import { Trophy, CheckCircle2, Star } from 'lucide-react'
import { Task, Project } from '@/types/task'

interface MonthlySummaryProps {
    tasks: Task[]
    projects: Project[]
    currentReferenceDate: Date
}

export const MonthlySummary = ({ tasks, projects, currentReferenceDate }: MonthlySummaryProps) => {
    const summary = useMemo(() => {
        const refMonth = currentReferenceDate.getMonth()
        const refYear = currentReferenceDate.getFullYear()

        const monthTasks = tasks.filter(t => {
            if (!t.due_date) return false
            const d = new Date(t.due_date)
            return d.getMonth() === refMonth && d.getFullYear() === refYear
        })

        const completedTasks = monthTasks.filter(t => t.is_completed)
        const totalProgress = monthTasks.length > 0 
            ? Math.round((completedTasks.length / monthTasks.length) * 100) 
            : 0

        // หาโปรเจกต์ที่โดดเด่นที่สุดในเดือนนี้
        const projectPerformances = projects.map(p => {
            const pTasks = monthTasks.filter(t => t.project_id === p.id)
            return {
                name: p.name,
                completed: pTasks.filter(t => t.is_completed).length,
                total: pTasks.length
            }
        }).sort((a, b) => b.completed - a.completed)

        return {
            totalTasks: monthTasks.length,
            completedCount: completedTasks.length,
            progress: totalProgress,
            topProject: projectPerformances[0]
        }
    }, [tasks, projects, currentReferenceDate])

    if (summary.totalTasks === 0) return null

    return (
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 text-white overflow-hidden relative mb-8">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-10 opacity-10">
                <Trophy size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <Star className="text-yellow-400 fill-yellow-400" size={20} />
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Monthly Snapshot</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div>
                        <h2 className="text-4xl font-black italic mb-2">
                            {summary.progress}% <span className="text-lg not-italic font-medium text-slate-400">Completed</span>
                        </h2>
                        <p className="text-slate-400 text-sm max-w-xs">
                            คุณปันทำเป้าหมายเสร็จไปแล้ว {summary.completedCount} จากทั้งหมด {summary.totalTasks} งานในเดือนนี้ค่ะ เก่งมาก ๆ เลยค่ะ! 
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-4xl p-6 border border-white/10">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Top Performer</p>
                        <div className="flex justify-between items-end">
                            <div>
                                <h4 className="text-xl font-black italic uppercase text-white">{summary.topProject.name}</h4>
                                <p className="text-xs text-slate-500">{summary.topProject.completed} Tasks Finished</p>
                            </div>
                            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-900/50">
                                <CheckCircle2 size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}