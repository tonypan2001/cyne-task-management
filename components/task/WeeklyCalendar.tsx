'use client'

import { useMemo } from 'react'
import { Task } from '@/types/task'
import Link from 'next/link'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

interface WeeklyCalendarProps {
    tasks: Task[]
    referenceDate: Date // ✨ รับมาจาก Page
    onDateChange: (date: Date) => void // ✨ ฟังก์ชันส่งค่ากลับไป Page
}

const getDayColor = (dayIndex: number) => {
    const colors = [
        'border-t-[#FF3B30]', // Sun
        'border-t-[#FFD60A]', // Mon
        'border-t-[#FF2D55]', // Tue
        'border-t-[#34C759]', // Wed
        'border-t-[#FF9500]', // Thu
        'border-t-[#5AC8FA]', // Fri
        'border-t-[#AF52DE]', // Sat
    ]
    return colors[dayIndex]
}

const priorityOrder: Record<string, number> = { 'High': 1, 'Medium': 2, 'Low': 3 }

export const WeeklyCalendar = ({ tasks, referenceDate, onDateChange }: WeeklyCalendarProps) => {

    // ✨ คำนวณวันทั้ง 7 โดยอ้างอิงจาก referenceDate ที่ได้รับมาจาก Props
    const days = useMemo(() => {
        const d = new Date(referenceDate)
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1) // เริ่มที่วันจันทร์
        const monday = new Date(d.setDate(diff))

        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(monday)
            date.setDate(monday.getDate() + i)
            return date
        })
    }, [referenceDate])

    // ✨ Handlers สำหรับเลื่อนสัปดาห์ (ส่งค่ากลับไป Update ที่หน้า Page)
    const nextWeek = () => {
        const next = new Date(referenceDate)
        next.setDate(next.getDate() + 7)
        onDateChange(next)
    }

    const prevWeek = () => {
        const prev = new Date(referenceDate)
        prev.setDate(prev.getDate() - 7)
        onDateChange(prev)
    }

    const resetToToday = () => onDateChange(new Date())

    return (
        <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-2xl shadow-slate-200/40 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-100">
                        <CalendarIcon size={18} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 italic tracking-tighter uppercase">Weekly Agenda</h3>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                            {days[0].toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - {days[6].toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                        </p>
                    </div>
                </div>

                {/* ✨ Navigation Controls */}
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <button onClick={prevWeek} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-blue-600 transition-all">
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={resetToToday} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                        <RotateCcw size={12} /> Today
                    </button>
                    <button onClick={nextWeek} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-blue-600 transition-all">
                        <ChevronRight size={18} />
                    </button>
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
                            className={`flex flex-col min-h-[160px] rounded-4xl p-4 transition-all border-t-[6px] shadow-sm ${getDayColor(dayIndex)} ${isToday
                                ? 'bg-blue-50/40 border-x-blue-100 border-b-blue-100 border-x border-b scale-[1.02] z-10'
                                : 'bg-slate-50 border-x-transparent border-b-transparent border-x border-b'
                                }`}
                        >
                            <div className="mb-4 flex justify-between items-start">
                                <div>
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </p>
                                    <p className={`text-lg font-black ${isToday ? 'text-blue-700' : 'text-slate-800'}`}>
                                        {date.getDate()}
                                    </p>
                                </div>
                                {isToday && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                            </div>

                            <div className="space-y-2 flex-1">
                                {tasksOnDay.map(task => (
                                    <Link href={`/task/${task.id}`} key={task.id} className="block p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-blue-400 hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <div className={`w-1 h-1 rounded-full ${task.priority === 'High' ? 'bg-red-500' : 'bg-blue-400'}`} />
                                            <span className="text-[7px] font-black text-slate-300 uppercase tracking-tighter">
                                                {task.priority || 'Medium'}
                                            </span>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-700 line-clamp-2 leading-tight group-hover:text-blue-600">
                                            {task.title}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}