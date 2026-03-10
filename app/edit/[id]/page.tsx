"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Edit3, Loader2 } from "lucide-react";
import { Project, TaskFormData } from "@/types/task";
import { TaskForm } from "@/components/task/TaskForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/components/shared/ToastProvider";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { PostgrestError } from "@supabase/supabase-js";

export default function EditTaskPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const { showToast } = useToast();

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [initialData, setInitialData] = useState<TaskFormData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // --- 1. โหลดข้อมูลเริ่มต้น (Workspace, Projects, Task) ---
  const fetchInitialData = useCallback(async () => {
    const activeId = localStorage.getItem("active_workspace_id");
    if (!activeId) {
      router.push("/workspaces");
      return;
    }
    setWorkspaceId(activeId);

    try {
      // ✨ เรียกใช้ Service เพื่อดึงข้อมูล Projects และ Task พร้อมกัน
      const [projectsData, taskData] = await Promise.all([
        projectService.getProjectsByWorkspace(activeId),
        taskService.getTaskById(taskId),
      ]);

      setProjects(projectsData);

      // จัดเตรียมข้อมูลเพื่อส่งให้ TaskForm
      setInitialData({
        title: taskData.title,
        description: taskData.description || "",
        selectedProjectId: taskData.project_id || "",
        assigneeName: taskData.assignee_name || "",
        due_date: taskData.due_date || "",
        priority: taskData.priority || "Medium",
        subTasks: taskData.sub_tasks || [],
        imageFile: null,
        existingImageUrl: taskData.image_url || undefined, // ส่งรูปเดิมไปแสดงผล
      });
    } catch (_) {
      if (_) showToast("Load Error", "error", "ไม่สามารถโหลดข้อมูลงานได้");
      router.push("/");
    } finally {
      setIsPageLoading(false);
    }
  }, [taskId, router, showToast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // --- 2. สร้าง Project (รองรับ PostgrestError) ---
  const handleCreateProject = async (name: string) => {
    if (!workspaceId) return null;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      const newProject = await projectService.createProject(
        name,
        userData.user.id,
        workspaceId,
      );

      setProjects((prev) => [...prev, newProject]);
      showToast("Success", "success", "เพิ่มโปรเจกต์ใหม่เรียบร้อยแล้ว");
      return newProject.id;
    } catch (err: unknown) {
      const error = err as PostgrestError; // ✨ แปลงเป็น PostgrestError ตามวิธีที่ 1
      if (error.code === "23505") {
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

  // --- 3. การจัดการลบโปรเจกต์ ---
  const handleDeleteProjectRequest = async (projectId: string) => {
    try {
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

  // --- 4. อัปเดต Task ---
  const handleUpdateTask = async (formData: TaskFormData) => {
    setLoading(true);
    try {
      let imageUrl = initialData?.existingImageUrl || "";

      // ถ้ามีการอัปโหลดรูปใหม่ ให้ใช้ Service จัดการ
      if (formData.imageFile) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          imageUrl = await taskService.uploadImage(
            userData.user.id,
            formData.imageFile,
          );
        }
      }

      const updateData = {
        title: formData.title,
        description: formData.description,
        image_url: imageUrl,
        project_id: formData.selectedProjectId,
        assignee_name: formData.assigneeName || "Unassigned",
        due_date: formData.due_date,
        priority: formData.priority || "Medium",
      };

      // ✨ เรียกใช้ Service อัปเดต Task และ Sub-tasks
      await taskService.updateTask(taskId, updateData, formData.subTasks);

      showToast("Task Updated", "success", "อัปเดตข้อมูลงานเรียบร้อยแล้ว");
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      showToast("Update Failed", "error", msg);
    } finally {
      setLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 gap-4">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <p className="font-black uppercase tracking-widest text-[10px] italic">
          Loading Task Data...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-in fade-in duration-700">
      <PageHeader
        title="Edit Task"
        subtitle="แก้ไขรายละเอียดและสถานะงานของคุณ"
        icon={<Edit3 size={16} />}
      />

      {/* Render Form เมื่อโหลดข้อมูล InitialData เสร็จเท่านั้น */}
      {initialData && (
        <TaskForm
          workspaceId={workspaceId!}
          initialData={initialData}
          projects={projects}
          onSubmit={handleUpdateTask}
          onAddProject={handleCreateProject}
          onDeleteProject={handleDeleteProjectRequest}
          loading={loading}
          isEditMode={true}
        />
      )}

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
