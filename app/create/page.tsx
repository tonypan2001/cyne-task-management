"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Plus, Loader2 } from "lucide-react";
import { Project, TaskFormData } from "@/types/task";
import { TaskForm } from "@/components/task/TaskForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/components/shared/ToastProvider";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService"; // ✨ Import projectService เพิ่มเข้ามา
import { PostgrestError } from "@supabase/supabase-js";

export default function CreateTaskPage() {
  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // --- 1. ตรวจสอบ Workspace เริ่มต้น ---
  useEffect(() => {
    const activeId = localStorage.getItem("active_workspace_id");
    if (!activeId) {
      router.push("/workspaces");
      return;
    }
    setWorkspaceId(activeId);
  }, [router]);

  // --- 2. Fetch Projects ---
  const fetchProjects = useCallback(async () => {
    if (!workspaceId) return;

    try {
      // ✨ เรียกใช้ Service แทนการเขียน Query ตรงๆ
      const data = await projectService.getProjectsByWorkspace(workspaceId);
      setProjects(data);
    } catch (_) {
      if (_) showToast("Sync Error", "error", "ไม่สามารถโหลดข้อมูลโปรเจกต์ได้");
    } finally {
      setIsPageLoading(false);
    }
  }, [workspaceId, showToast]);

  useEffect(() => {
    if (workspaceId) {
      fetchProjects();
    }
  }, [workspaceId, fetchProjects]);

  // --- 3. สร้าง Project ---
  const handleCreateProject = async (name: string) => {
    if (!workspaceId) {
      showToast("Error", "error", "ไม่พบข้อมูล Workspace ปัจจุบัน");
      return null;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;

      // ✨ เรียกใช้ Service สำหรับสร้าง Project
      const newProject = await projectService.createProject(
        name,
        user.id,
        workspaceId,
      );

      setProjects((prev) => [...prev, newProject]);
      showToast("Success", "success", "เพิ่มโปรเจกต์ใหม่เรียบร้อยแล้ว");
      return newProject.id;
    } catch (err: unknown) {
      const error = err as PostgrestError;
      // จับ Error กรณีชื่อซ้ำ
      if (error?.code === "23505") {
        showToast(
          "Duplicate Name",
          "warning",
          "ชื่อโปรเจกต์นี้มีอยู่แล้วในพื้นที่ทำงานนี้",
        );
      } else {
        showToast("Error", "error", "ไม่สามารถสร้างโปรเจกต์ได้ในขณะนี้");
      }
      return null;
    }
  };

  // --- 4. Logic การจัดการลบโปรเจกต์ ---
  const handleDeleteProjectRequest = async (projectId: string) => {
    try {
      // ✨ เรียกใช้ Service สำหรับเช็คจำนวนงานก่อนลบ
      const count = await projectService.checkTasksCountInProject(projectId);

      if (count > 0) {
        showToast(
          "Cannot Delete",
          "warning",
          `โปรเจกต์นี้ยังมีงานค้างอยู่ ${count} รายการ`,
        );
        return false;
      }

      setProjectToDelete(projectId);
      setIsDeleteModalOpen(true);
      return false;
    } catch (_) {
      if (_) showToast("Error", "error", "ไม่สามารถตรวจสอบข้อมูลได้");
      return false;
    }
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    setIsDeletingProject(true);
    try {
      // ✨ เรียกใช้ Service สำหรับลบ Project จริง
      await projectService.deleteProject(projectToDelete);

      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete));
      showToast("Project Removed", "success", "ลบโปรเจกต์ออกจากระบบแล้ว");
      setIsDeleteModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      showToast("Delete Failed", "error", msg);
    } finally {
      setIsDeletingProject(false);
      setProjectToDelete(null);
    }
  };

  // --- 5. สร้าง Task ---
  const handleCreateTask = async (formData: TaskFormData) => {
    if (!workspaceId) return;

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("กรุณาเข้าสู่ระบบก่อนดำเนินการนะ");

      let imageUrl = "";
      if (formData.imageFile) {
        // ✨ เรียกใช้ Service อัปโหลดรูป
        imageUrl = await taskService.uploadImage(user.id, formData.imageFile);
      }

      const newTaskData = {
        title: formData.title,
        description: formData.description,
        image_url: imageUrl,
        user_id: user.id,
        workspace_id: workspaceId,
        project_id: formData.selectedProjectId,
        creator_name: user.email,
        assignee_name: formData.assigneeName || "Unassigned",
        due_date: formData.due_date,
        priority: formData.priority || "Medium",
      };

      // ✨ เรียกใช้ Service สร้าง Task และ SubTasks รวดเดียวจบ
      await taskService.createTask(newTaskData, formData.subTasks);

      showToast("Task Created", "success", "สร้างงานใหม่เข้าสู่ระบบสำเร็จแล้ว");
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      showToast("Creation Failed", "error", msg);
    } finally {
      setLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 gap-4">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <p className="font-black uppercase tracking-widest text-[10px] italic">
          Loading Workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-in fade-in duration-700">
      <PageHeader
        title="Create Task"
        subtitle="เพิ่มงานใหม่เข้าสู่พื้นที่ทำงานปัจจุบันของคุณ"
        icon={<Plus size={16} />}
      />

      <TaskForm
        workspaceId={workspaceId!} // ✨ เพิ่มบรรทัดนี้เพื่อส่ง ID ไปให้ Dropdown ค้นหาคน
        projects={projects}
        onSubmit={handleCreateTask}
        onAddProject={handleCreateProject}
        onDeleteProject={handleDeleteProjectRequest}
        loading={loading}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteProject}
        isLoading={isDeletingProject}
        title="Remove Project?"
        description="โปรเจกต์นี้จะถูกลบออกจากระบบอย่างถาวร"
        confirmText="Yes, Remove it"
      />
    </div>
  );
}
