import { createClient } from "@/lib/supabase";
import { Workspace } from "@/types/task";

export const workspaceService = {
  // 1. ดึง Workspaces ทั้งหมด
  getWorkspaces: async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data as Workspace[];
  },

  // 2. สร้าง Workspace ใหม่
  createWorkspace: async (name: string, userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workspaces")
      .insert({ name, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data as Workspace;
  },

  // ✨ 3. ดึงข้อมูล Workspace ตาม ID
  getWorkspaceById: async (workspaceId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .single();

    if (error) throw error;
    return data as Workspace;
  },

  // ✨ 4. ลบ Workspace
  deleteWorkspace: async (workspaceId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("workspaces")
      .delete()
      .eq("id", workspaceId);

    if (error) throw error;
  },
};
