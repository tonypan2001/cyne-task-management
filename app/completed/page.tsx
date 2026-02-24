"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trophy, ArrowLeft, LayoutGrid, RotateCcw } from "lucide-react";
import Link from "next/link";

import { Task, Project } from "@/types/task";
import { TaskCard } from "@/components/task/TaskCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/components/shared/ToastProvider";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";

export default function CompletedTasksPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // ตรวจสอบ Workspace
  useEffect(() => {
    const activeId = localStorage.getItem("active_workspace_id");
    if (!activeId) {
      router.push("/workspaces");
      return;
    }
    setWorkspaceId(activeId);
  }, [router]);

  // ดึงข้อมูลผ่าน Service
  const fetchAchievementData = useCallback(async () => {
    if (!workspaceId) return;

    try {
      const [tasksData, projectsData] = await Promise.all([
        taskService.getCompletedTasksByWorkspace(workspaceId),
        projectService.getProjectsByWorkspace(workspaceId),
      ]);

      setCompletedTasks(tasksData);
      setProjects(projectsData);
    } catch (err) {
      console.error("Error fetching achievements:", err);
      showToast("Load Error", "error", "ไม่สามารถโหลดข้อมูลงานที่เสร็จแล้วได้");
    } finally {
      setLoading(false);
    }
  }, [workspaceId, showToast]);

  useEffect(() => {
    fetchAchievementData();
  }, [fetchAchievementData]);

  // ✨ ฟังก์ชันนำงานกลับไปทำต่อ (Restore)
  const handleRestoreTask = async (taskId: string) => {
    setRestoringId(taskId);
    try {
      // ✨ เรียกใช้โดยส่งแค่ taskId ตัวเดียว
      await taskService.updateTaskStatus(taskId);

      // ลบการ์ดออกจากหน้าปัจจุบัน
      setCompletedTasks((prev) => prev.filter((t) => t.id !== taskId));
      showToast("Task Restored", "success", "นำงานกลับไปยังหน้าบอร์ดหลักแล้ว");
    } catch (err) {
      console.error("Failed to restore:", err);
      showToast("Restore Failed", "error", "ไม่สามารถกู้คืนงานได้");
    } finally {
      setRestoringId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 gap-4 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
        <p className="font-black uppercase tracking-widest text-[10px] italic">
          Collecting your victories...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-10 pb-20 animate-in slide-in-from-bottom-4 duration-700 px-4 md:px-8">
      <PageHeader
        title="Hall of Fame"
        subtitle={`คุณทำโปรเจกต์เสร็จสมบูรณ์ไปแล้ว ${completedTasks.length} รายการ ยอดเยี่ยมที่สุด!`}
        icon={<Trophy size={16} className="text-yellow-500" />}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 px-6 py-3.5 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-slate-800 hover:border-blue-200 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
        >
          <ArrowLeft size={16} />
          Back to Board
        </Link>
      </PageHeader>

      {/* Task Grid */}
      {completedTasks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {completedTasks.map((task) => (
            <div key={task.id} className="relative group">
              <div className="opacity-70 group-hover:opacity-100 transition-all duration-500 group-hover:scale-[1.02]">
                <TaskCard task={task} projects={projects} />
              </div>

              {/* ✨ ปุ่ม Restore ลอยทับบนการ์ด จะโชว์เมื่อเอาเมาส์ไปชี้ */}
              <button
                onClick={() => handleRestoreTask(task.id)}
                disabled={restoringId === task.id}
                className="absolute top-4 right-4 z-10 p-3 bg-white/90 backdrop-blur-sm text-blue-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:bg-blue-50 hover:scale-110 transition-all duration-300 disabled:opacity-50"
                title="นำกลับไปทำต่อ"
              >
                <RotateCcw
                  size={16}
                  className={restoringId === task.id ? "animate-spin" : ""}
                />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-200">
            <Trophy size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-800 italic uppercase">
            No Trophies Yet
          </h3>
          <p className="text-slate-400 mt-2 font-bold text-sm">
            งานที่ทำเสร็จจะมาโชว์ที่นี่
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-3 mt-8 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95"
          >
            <LayoutGrid size={16} />
            Start New Task
          </Link>
        </div>
      )}
    </div>
  );
}
