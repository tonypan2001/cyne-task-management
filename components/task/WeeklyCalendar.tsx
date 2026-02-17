'use client'

import { Task } from '@/types/task'
import Link from 'next/link'
import { Calendar as CalendarIcon } from 'lucide-react'

interface WeeklyCalendarProps {
    tasks: Task[]
}

// ✨ กำหนดสีประจำวัน (สไตล์ไทย)
const getDayColor = (dayIndex: number) => {
    const colors = [
        'bg-[#FF3B30]', // Sun - แดง
        'bg-[#FFD60A]', // Mon - เหลือง
        'bg-[#FF2D55]', // Tue - ชมพู
        'bg-[#34C759]', // Wed - เขียว
        'bg-[#FF9500]', // Thu - ส้ม
        'bg-[#5AC8FA]', // Fri - ฟ้า
        'bg-[#AF52DE]', // Sat - ม่วง
    ]
    return colors[dayIndex]
}

// ✨ ลำดับความสำคัญ (ยิ่งน้อยยิ่งอยู่บน)
const priorityOrder: Record<string, number> = {
    'High': 1,
    'Medium': 2,
    'Low': 3
}

export const WeeklyCalendar = ({ tasks }: WeeklyCalendarProps) => {
    // ฟังก์ชันหาช่วงวันที่ของสัปดาห์ปัจจุบัน (จันทร์ - อาทิตย์)
    const getDaysOfWeek = () => {
        const today = new Date()
        const day = today.getDay()
        // ปรับให้เริ่มที่วันจันทร์ (Monday = 1)
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
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-slate-800 italic flex items-center gap-3 tracking-tighter">
                    <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-100">
                        <CalendarIcon size={20} />
                    </div>
                    Weekly Agenda
                </h3>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                    {days[0].toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - {days[6].toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {days.map((date) => {
                    const dayIndex = date.getDay()
                    const dateString = date.toISOString().split('T')[0]
                    const isToday = new Date().toISOString().split('T')[0] === dateString

                    // ✨ กรองงานเฉพาะวันนั้น และเรียงตาม Priority (High > Medium > Low)
                    const tasksOnDay = tasks
                        .filter(t => t.due_date === dateString)
                        .sort((a, b) => {
                            const priorityA = a.priority || 'Medium'
                            const priorityB = b.priority || 'Medium'
                            return (priorityOrder[priorityA] || 2) - (priorityOrder[priorityB] || 2)
                        })

                    return (
                        <div
                            key={dateString}
                            className={`relative flex flex-col min-h-[180px] rounded-4xl p-5 pt-7 transition-all ${isToday ? 'bg-blue-50/40 border-2 border-blue-100 shadow-inner' : 'bg-slate-50 border border-transparent'
                                }`}
                        >
                            {/* ✨ แถบสีประจำวันด้านบน */}
                            <div className={`absolute top-0 left-0 right-0 h-2 rounded-t-4xl ${getDayColor(dayIndex)}`} />

                            <div className="mb-4">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </p>
                                <p className={`text-xl font-black ${isToday ? 'text-blue-700' : 'text-slate-800'}`}>
                                    {date.getDate()}
                                </p>
                            </div>

                            <div className="space-y-2.5 flex-1">
                                {tasksOnDay.map(task => (
                                    <Link
                                        href={`/task/${task.id}`}
                                        key={task.id}
                                        className="block p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-400 hover:shadow-md transition-all group overflow-hidden relative"
                                    >
                                        {/* Priority Indicator */}
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'High' ? 'bg-red-500 animate-pulse' :
                                                    task.priority === 'Low' ? 'bg-slate-300' : 'bg-blue-400'
                                                }`} />
                                            <span className={`text-[7px] font-black uppercase tracking-tighter ${task.priority === 'High' ? 'text-red-500' : 'text-slate-400'
                                                }`}>
                                                {task.priority || 'Medium'}
                                            </span>
                                        </div>

                                        <p className="text-[10px] font-bold text-slate-700 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                            {task.title}
                                        </p>

                                        <div className="mt-2 flex items-center gap-1 opacity-60">
                                            <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">
                                                {task.assignee_name?.split(' ')[0] || 'Member'}
                                            </span>
                                        </div>
                                    </Link>
                                ))}

                                {tasksOnDay.length === 0 && (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
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