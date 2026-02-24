"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { WeeklyCalendarProps } from "@/types/calendar";
import { DAY_COLORS, PRIORITY_ORDER } from "@/constants/colors";

export const WeeklyCalendar = ({
  tasks,
  referenceDate,
  onDateChange,
}: WeeklyCalendarProps) => {
  // 🗓️ คำนวณวันทั้ง 7 ในสัปดาห์
  const days = useMemo(() => {
    const startOfWeek = new Date(referenceDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, [referenceDate]);

  // 🧭 Navigation Handlers
  const nextWeek = () => {
    const next = new Date(referenceDate);
    next.setDate(next.getDate() + 7);
    onDateChange(next);
  };

  const prevWeek = () => {
    const prev = new Date(referenceDate);
    prev.setDate(prev.getDate() - 7);
    onDateChange(prev);
  };

  const resetToToday = () => onDateChange(new Date());

  return (
    <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-2xl shadow-slate-200/40 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-100">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 italic tracking-tighter uppercase">
              Weekly Agenda
            </h3>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
              {days[0].toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
              })}{" "}
              -{" "}
              {days[6].toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button
            onClick={prevWeek}
            className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-blue-600 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={resetToToday}
            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={12} /> Today
          </button>
          <button
            onClick={nextWeek}
            className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-blue-600 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {days.map((date) => {
          const dayIndex = date.getDay();
          const YYYY = date.getFullYear();
          const MM = String(date.getMonth() + 1).padStart(2, "0");
          const DD = String(date.getDate()).padStart(2, "0");
          const dateString = `${YYYY}-${MM}-${DD}`;

          const todayObj = new Date();
          const isToday =
            todayObj.getFullYear() === YYYY &&
            todayObj.getMonth() === date.getMonth() &&
            todayObj.getDate() === date.getDate();

          const tasksOnDay = tasks
            .filter((t) => t.due_date === dateString)
            .sort(
              (a, b) =>
                PRIORITY_ORDER[a.priority || "Medium"] -
                PRIORITY_ORDER[b.priority || "Medium"],
            );

          return (
            <div
              key={dateString}
              className={`flex flex-col min-h-[160px] rounded-4xl p-4 transition-all border-t-[6px] shadow-sm ${DAY_COLORS[dayIndex]} ${
                isToday
                  ? "bg-blue-50/40 border-x-blue-100 border-b-blue-100 border-x border-b scale-[1.02] z-10"
                  : "bg-slate-50 border-x-transparent border-b-transparent border-x border-b"
              }`}
            >
              <div className="mb-4 flex justify-between items-start">
                <div>
                  <p
                    className={`text-[9px] font-black uppercase tracking-widest ${isToday ? "text-blue-600" : "text-slate-400"}`}
                  >
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                  <p
                    className={`text-lg font-black ${isToday ? "text-blue-700" : "text-slate-800"}`}
                  >
                    {date.getDate()}
                  </p>
                </div>
                {isToday && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                )}
              </div>

              {/* Tasks List in Day */}
              <div className="space-y-2 flex-1">
                {tasksOnDay.map((task) => {
                  const isDone = task.is_completed;
                  return (
                    <Link
                      href={`/task/${task.id}`}
                      key={task.id}
                      className={`flex flex-col justify-between min-h-[64px] p-2.5 rounded-xl border transition-all group ${
                        isDone
                          ? "bg-slate-100/80 border-slate-200 opacity-60"
                          : "bg-white border-slate-100 shadow-sm hover:border-blue-400 hover:shadow-md"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div
                            className={`w-1 h-1 rounded-full ${
                              isDone
                                ? "bg-slate-400"
                                : task.priority === "High"
                                  ? "bg-red-500"
                                  : "bg-blue-400"
                            }`}
                          />
                          <span
                            className={`text-[7px] font-black uppercase tracking-tighter ${
                              isDone ? "text-slate-400" : "text-slate-300"
                            }`}
                          >
                            {task.priority || "Medium"}
                          </span>
                        </div>
                        <p
                          className={`text-[9px] font-bold line-clamp-2 leading-tight transition-all ${
                            isDone
                              ? "text-slate-400 line-through italic"
                              : "text-slate-700 group-hover:text-blue-600"
                          }`}
                        >
                          {task.title}
                        </p>
                      </div>

                      {/* Avatar Assignee มุมขวาล่าง พร้อม Tooltip */}
                      <div className="mt-2.5 flex justify-end">
                        {/* ✨ ใช้ group/tooltip เพื่อจับการ Hover เฉพาะตรง Avatar */}
                        <div className="relative group/tooltip">
                          <div
                            className={`w-5 h-5 rounded-[0.4rem] flex items-center justify-center text-[8px] font-black shadow-sm border ${
                              isDone
                                ? "bg-slate-200 text-slate-400 border-slate-300"
                                : "bg-slate-900 text-white border-slate-700"
                            }`}
                          >
                            {task.assignee_name?.charAt(0).toUpperCase() || "?"}
                          </div>

                          {/* ✨ กล่อง Tooltip */}
                          <div className="absolute bottom-full right-0 mb-1.5 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                            <div className="bg-slate-800 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-slate-700">
                              {task.assignee_name || "Unassigned"}
                            </div>
                            {/* ติ่งลูกศรชี้ลง (Triangle) */}
                            <div className="absolute top-full right-1.5 -mt-px border-4 border-transparent border-t-slate-800" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
