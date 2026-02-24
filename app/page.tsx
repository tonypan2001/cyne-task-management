"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  Search,
  LayoutGrid,
  Filter,
  Plus,
  Flame,
  X,
  Trophy,
} from "lucide-react"; // ✨ ลบ CheckCircle2 เพิ่ม Trophy
import Link from "next/link";

import { Task, Project } from "@/types/task";
import { TaskCard } from "@/components/task/TaskCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { WeeklyCalendar } from "@/components/task/WeeklyCalendar";
import { MonthlyGoals } from "@/components/dashboard/MonthlyGoals";
import { OverdueSection } from "@/components/dashboard/OverdueSection";
import { useAdmin } from "@/hook/useAdmin";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const { isAdmin, loading: adminLoading } = useAdmin();

  // States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [activeProjectId, setActiveProjectId] = useState("All");

  const [referenceDate, setReferenceDate] = useState(new Date());

  // --- 1. Fetch Data ---
  useEffect(() => {
    async function fetchData() {
      const workspaceId = localStorage.getItem("active_workspace_id");

      if (!workspaceId) {
        router.push("/workspaces");
        return;
      }

      try {
        const { data: wsCheck, error: wsError } = await supabase
          .from("workspaces")
          .select("id")
          .eq("id", workspaceId)
          .single();

        if (wsError || !wsCheck) {
          localStorage.removeItem("active_workspace_id");
          router.push("/workspaces");
          return;
        }

        const [tasksData, projectsData] = await Promise.all([
          taskService.getTasksByWorkspace(workspaceId),
          projectService.getProjectsByWorkspace(workspaceId),
        ]);

        if (tasksData) setTasks(tasksData);
        if (projectsData) setProjects(projectsData);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [supabase, router]);

  const overdueTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter((t) => {
      if (!t.due_date || t.is_completed) return false;

      const [year, month, day] = t.due_date.split("-").map(Number);
      const taskDate = new Date(year, month - 1, day);
      taskDate.setHours(0, 0, 0, 0);

      return taskDate < today;
    });
  }, [tasks]);

  // --- 2. Grouping & Filtering Logic ---
  const groupedTasks = useMemo(() => {
    const filtered = tasks.filter((t) => {
      const matchProject =
        activeProjectId === "All" || t.project_id === activeProjectId;
      const matchSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.assignee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false);

      // ✨ กรองเฉพาะงานที่ "ยังไม่เสร็จ" (is_completed: false) เท่านั้นที่จะได้มาโชว์ในบอร์ดนี้
      return matchProject && matchSearch && !t.is_completed;
    });

    return {
      urgent: filtered.filter((t) => t.priority === "High"),
      stream: filtered.filter((t) => t.priority !== "High"),
      // ✨ ลบหมวดหมู่ finished ออกไปเลย เพราะเราไม่โชว์งานเสร็จแล้วในหน้านี้
    };
  }, [searchTerm, activeProjectId, tasks]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 gap-4 font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="font-black uppercase tracking-widest text-[10px] italic">
          Syncing Board...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700 px-4 md:px-8">
      {/* 3. Page Header */}
      <PageHeader
        title="Control Center"
        subtitle={`Urgent: ${groupedTasks.urgent.length} / Total Active: ${groupedTasks.urgent.length + groupedTasks.stream.length}`}
        icon={<LayoutGrid size={16} />}
      >
        {!adminLoading && isAdmin && (
          <Link
            href="/create"
            className="bg-slate-900 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2.5 hover:bg-blue-600 transition-all shadow-lg active:scale-95 shrink-0"
          >
            <Plus size={20} />
            <span className="text-[11px] font-black uppercase tracking-widest">
              New Task
            </span>
          </Link>
        )}
      </PageHeader>

      {/* กราฟและปฏิทินยังคงส่ง tasks ไปทั้งหมดเพื่อให้คำนวณสถิติรายเดือน/สัปดาห์ได้ถูกต้อง */}
      <MonthlyGoals
        tasks={tasks}
        projects={projects}
        currentReferenceDate={referenceDate}
      />

      <OverdueSection tasks={overdueTasks} projects={projects} />

      {/* 4. Weekly Calendar */}
      <WeeklyCalendar
        tasks={tasks}
        referenceDate={referenceDate}
        onDateChange={setReferenceDate}
      />

      {/* 5. Filter & Search Section */}
      <div className="space-y-4">
        {/* Project Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-400 mr-1 shrink-0">
            <Filter size={16} />
          </div>
          <button
            onClick={() => setActiveProjectId("All")}
            className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeProjectId === "All"
                ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                : "bg-white text-slate-400 border border-slate-50 hover:bg-slate-50"
            }`}
          >
            All
          </button>
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setActiveProjectId(project.id)}
              className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeProjectId === project.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                  : "bg-white text-slate-400 border border-slate-50 hover:bg-slate-50"
              }`}
            >
              {project.name}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-md group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
            size={14}
          />
          <input
            type="text"
            placeholder="Quick search assets or assignee..."
            className="w-full pl-10 pr-10 py-3 bg-white/60 rounded-xl border border-slate-100 shadow-sm outline-none font-bold text-[11px] focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-200 transition-all placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors p-1"
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      {/* 6. 🔥 URGENT SECTION */}
      {groupedTasks.urgent.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-xl text-white shadow-md animate-pulse">
              <Flame size={16} />
            </div>
            <h2 className="text-xl font-black text-slate-800 italic tracking-tighter uppercase">
              Urgent Assets
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {groupedTasks.urgent.map((task) => (
              <TaskCard key={task.id} task={task} projects={projects} />
            ))}
          </div>
        </section>
      )}

      {/* 7. 📋 WORK STREAM */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md">
            <LayoutGrid size={16} />
          </div>
          <h2 className="text-xl font-black text-slate-800 italic tracking-tighter uppercase">
            Work Stream
          </h2>
        </div>

        {groupedTasks.stream.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {groupedTasks.stream.map((task) => (
              <TaskCard key={task.id} task={task} projects={projects} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
            <p className="text-slate-300 text-xs font-bold italic">
              No active assets in queue.
            </p>
          </div>
        )}
      </section>

      {/* 8. 🏆 ลิงก์ไปยังหน้า Completed (แทนที่ของเดิม) */}
      <div className="flex justify-center pt-10 mt-10 border-t border-slate-100">
        <Link
          href="/completed"
          className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-400 hover:text-yellow-600 hover:border-yellow-200 hover:bg-yellow-50 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest shadow-sm group"
        >
          <Trophy
            size={16}
            className="group-hover:scale-110 transition-transform"
          />
          View Hall of Fame (Completed Assets)
        </Link>
      </div>
    </div>
  );
}
