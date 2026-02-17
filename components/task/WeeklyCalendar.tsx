// components/task/WeeklyCalendar.tsx
'use client'

import { Task } from '@/types/task'
import Link from 'next/link'
import { Calendar as CalendarIcon } from 'lucide-react'

interface WeeklyCalendarProps {
    tasks: Task[]
}

export const WeeklyCalendar = ({ tasks }: WeeklyCalendarProps) => {
    // ฟังก์ชันหาช่วงวันที่ของสัปดาห์ปัจจุบัน (จันทร์ - อาทิตย์)
    const getDaysOfWeek = () => {
        const today = new Date()
        const day = today.getDay()
        const diff = today.getDate() - day + (day === 0 ? -6 : 1) // เริ่มที่วันจันทร์
        const monday = new Date(today.setDate(diff))

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday)
            d.setDate(monday.getDate() + i)
            return d
        })
    }

    const days = getDaysOfWeek()

    return (
        <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-2xl shadow-slate-200/40 animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 italic flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-xl text-blue-600"><CalendarIcon size={20} /></div>
                    Weekly Agenda
                </h3>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {days[0].toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - {days[6].toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {days.map((date) => {
                    const dateString = date.toISOString().split('T')[0]
                    const tasksOnDay = tasks.filter(t => t.due_date === dateString)
                    const isToday = new Date().toISOString().split('T')[0] === dateString

                    return (
                        <div key={dateString} className={`flex flex-col min-h-[150px] rounded-3xl p-4 transition-all ${isToday ? 'bg-blue-50/50 border-2 border-blue-100' : 'bg-slate-50 border border-transparent'}`}>
                            <div className="mb-3">
                                <p className={`text-[10px] font-black uppercase tracking-tighter ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </p>
                                <p className={`text-lg font-black ${isToday ? 'text-blue-700' : 'text-slate-800'}`}>
                                    {date.getDate()}
                                </p>
                            </div>

                            <div className="space-y-2 flex-1">
                                {tasksOnDay.map(task => (
                                    <Link href={`/task/${task.id}`} key={task.id} className="block p-2 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-blue-400 transition-all group">
                                        <p className="text-[9px] font-bold text-slate-700 line-clamp-2 leading-tight group-hover:text-blue-600">
                                            {task.title}
                                        </p>
                                        <div className="mt-1 flex items-center gap-1">
                                            <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                                            <span className="text-[7px] font-black text-slate-300 uppercase">{task.assignee_name?.split(' ')[0]}</span>
                                        </div>
                                    </Link>
                                ))}
                                {tasksOnDay.length === 0 && (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}