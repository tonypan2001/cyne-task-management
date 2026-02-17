'use client'

import { Task } from '@/types/task'
import Link from 'next/link'
import { Calendar as CalendarIcon } from 'lucide-react'

interface WeeklyCalendarProps {
    tasks: Task[]
}

// ✨ ปรับโทนสีให้ซอฟต์ลงและดูพรีเมียมขึ้น
const getDayColor = (dayIndex: number) => {
    const colors = [
        'border-t-[#FF3B30]', // Sun - แดง
        'border-t-[#FFD60A]', // Mon - เหลือง
        'border-t-[#FF2D55]', // Tue - ชมพู
        'border-t-[#34C759]', // Wed - เขียว
        'border-t-[#FF9500]', // Thu - ส้ม
        'border-t-[#5AC8FA]', // Fri - ฟ้า
        'border-t-[#AF52DE]', // Sat - ม่วง
    ]
    return colors[dayIndex]
}

const priorityOrder: Record<string, number> = {
    'High': 1,
    'Medium': 2,
    'Low': 3
}

export const WeeklyCalendar = ({ tasks }: WeeklyCalendarProps) => {
    const getDaysOfWeek = () => {
        const today = new Date()
        const day = today.getDay()
        const diff = today.getDate() - day + (day === 0 ? -6 : 1)
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
                <h3 className="text-xl font-black text-slate-800 italic flex items-center gap-3 tracking-tighter">
                    <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-100">
                        <CalendarIcon size={18} />
                    </div>
                    Weekly Agenda
                </h3>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                    {days[0].toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - {days[6].toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {days.map((date) => {
                    const dayIndex = date.getDay()
                    const dateString = date.toISOString().split('T')[0]
                    const isToday = new Date().toISOString().split('T')[0] === dateString

                    const tasksOnDay = tasks
                        .filter(t => t.due_date === dateString)
                        .sort((a, b) => (priorityOrder[a.priority || 'Medium'] - priorityOrder[b.priority || 'Medium']))

                    return (
                        <div
                            key={dateString}
                            className={`flex flex-col min-h-[160px] rounded-4xl p-4 transition-all border-t-[6px] shadow-sm ${getDayColor(dayIndex)
                                } ${isToday
                                    ? 'bg-blue-50/40 border-x-blue-100 border-b-blue-100 border-x border-b scale-[1.02] shadow-blue-100'
                                    : 'bg-slate-50 border-x-transparent border-b-transparent border-x border-b'
                                }`}
                        >
                            <div className="mb-3 flex justify-between items-start">
                                <div>
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </p>
                                    <p className={`text-lg font-black ${isToday ? 'text-blue-700' : 'text-slate-800'}`}>
                                        {date.getDate()}
                                    </p>
                                </div>
                                {isToday && <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />}
                            </div>

                            <div className="space-y-2 flex-1">
                                {tasksOnDay.map(task => (
                                    <Link
                                        href={`/task/${task.id}`}
                                        key={task.id}
                                        className="block p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-blue-400 hover:shadow-md transition-all group overflow-hidden"
                                    >
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <div className={`w-1 h-1 rounded-full ${task.priority === 'High' ? 'bg-red-500' : 'bg-blue-400'
                                                }`} />
                                            <span className="text-[7px] font-black text-slate-300 uppercase tracking-tighter">
                                                {task.priority || 'Medium'}
                                            </span>
                                        </div>

                                        <p className="text-[9px] font-bold text-slate-700 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                            {task.title}
                                        </p>
                                    </Link>
                                ))}

                                {tasksOnDay.length === 0 && (
                                    <div className="flex-1 flex items-center justify-center opacity-20">
                                        <div className="w-1 h-1 rounded-full bg-slate-400" />
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