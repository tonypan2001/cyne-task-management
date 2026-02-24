import Link from "next/link";
import NextImage from "next/image";
import { Briefcase, Clock, AlertCircle } from "lucide-react";
import { TaskCardProps } from "@/types/task";

export const TaskCard = ({ task, projects }: TaskCardProps) => {
  const projectName =
    projects.find((p) => p.id === task.project_id)?.name || "General Asset";
  const priority = task.priority || "Medium";

  // ✨ จัดกลุ่มสี (Theme) ให้เนี้ยบขึ้น ใช้ Gradient และ Border บางๆ ให้ดูพรีเมียม
  const priorityTheme = {
    High: {
      bar: "bg-gradient-to-b from-rose-400 to-rose-600",
      badge:
        "bg-rose-50 text-rose-600 border-rose-200 shadow-sm shadow-rose-100",
      alertBg: "bg-rose-50",
      alertIcon: "text-rose-500",
    },
    Medium: {
      bar: "bg-gradient-to-b from-blue-400 to-blue-600",
      badge:
        "bg-blue-50 text-blue-600 border-blue-200 shadow-sm shadow-blue-100",
      alertBg: "",
      alertIcon: "",
    },
    Low: {
      bar: "bg-gradient-to-b from-slate-300 to-slate-400",
      badge:
        "bg-slate-50 text-slate-500 border-slate-200 shadow-sm shadow-slate-100",
      alertBg: "",
      alertIcon: "",
    },
  }[priority as "High" | "Medium" | "Low"] || {
    bar: "bg-gradient-to-b from-blue-400 to-blue-600",
    badge: "bg-blue-50 text-blue-600 border-blue-200 shadow-sm shadow-blue-100",
    alertBg: "",
    alertIcon: "",
  };

  return (
    <Link
      href={`/task/${task.id}`}
      className="group bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-lg shadow-slate-200/30 hover:shadow-blue-900/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
    >
      {/* แถบสีข้างการ์ด: เปลี่ยนจากสีทึบเป็น Gradient และปรับให้มนนิดๆ */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${priorityTheme.bar} opacity-90 group-hover:opacity-100 transition-opacity`}
      />

      <div className="flex justify-between items-start mb-5 pl-2">
        {/* แสดงชื่อโปรเจกต์ */}
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-900 p-2 rounded-xl text-white shadow-md shadow-slate-200">
            <Briefcase size={12} strokeWidth={2.5} />
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] italic line-clamp-1">
            {projectName}
          </span>
        </div>

        {/* ✨ Priority Badge ที่ปรับดีไซน์ใหม่ */}
        <div
          className={`px-3 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-widest transition-colors ${priorityTheme.badge}`}
        >
          {priority}
        </div>
      </div>

      {task.image_url && (
        <div className="relative w-full h-32 mb-5 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
          {/* เพิ่ม Overlay บางๆ เวลา Hover รูป */}
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors z-10" />
          <NextImage
            src={task.image_url}
            alt={task.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            unoptimized
          />
        </div>
      )}

      <div className="space-y-2 mb-6 pl-2">
        <h3 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 italic tracking-tight leading-snug">
          {task.title}
        </h3>

        {task.due_date && (
          <div className="flex items-center gap-1.5 text-slate-400 mt-2">
            <Clock size={12} strokeWidth={2.5} />
            <span className="text-[10px] font-bold italic tracking-wide">
              {new Date(task.due_date).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Footer ของ Card */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between pl-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white border border-slate-200 shadow-sm text-[10px]">
            {task.assignee_name?.charAt(0).toUpperCase() || "?"}
          </div>
          <span className="text-[10px] font-bold text-slate-500 line-clamp-1">
            {task.assignee_name || "Unassigned"}
          </span>
        </div>

        {priority === "High" && (
          <div
            className={`${priorityTheme.alertBg} p-1.5 rounded-lg border border-rose-100 shadow-sm`}
          >
            <AlertCircle
              size={14}
              strokeWidth={2.5}
              className={`${priorityTheme.alertIcon} animate-pulse`}
            />
          </div>
        )}
      </div>
    </Link>
  );
};
