import { createClient } from "@/lib/supabase";
import { Project, Task } from "@/types/task";

export const projectService = {
  // 1. ดึงโปรเจกต์ทั้งหมดใน Workspace
  getProjectsByWorkspace: async (workspaceId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id, name")
      .eq("workspace_id", workspaceId)
      .order("name");

    if (error) throw error;
    return data as Project[];
  },

  // 2. สร้างโปรเจกต์ใหม่
  createProject: async (name: string, userId: string, workspaceId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .insert({ name, user_id: userId, workspace_id: workspaceId })
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  // 3. เช็คจำนวนงานก่อนลบ
  checkTasksCountInProject: async (projectId: string) => {
    const supabase = createClient();
    const { count, error } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);

    if (error) throw error;
    return count || 0;
  },

  // 4. ลบโปรเจกต์
  deleteProject: async (projectId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);
    if (error) throw error;
  },

  // ✨ 5. ดึงข้อมูลโปรเจกต์เดี่ยวตาม ID
  getProjectById: async (projectId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) throw error;
    return data as Project;
  },

  // ✨ 6. ดึงงานทั้งหมดที่อยู่ในโปรเจกต์นี้
  getTasksByProject: async (projectId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Task[];
  },
};
