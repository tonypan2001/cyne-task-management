import { createClient } from "@/lib/supabase";

// ✨ ย้าย Interface มาไว้ที่นี่ เพื่อให้เรียกใช้เป็นมาตรฐานเดียวกัน
export interface TeamMember {
  member_id: string;
  user_id: string;
  email: string;
  role: string;
  joined_at: string;
}

export const teamService = {
  // 1. ดึงข้อมูลสมาชิกใน Workspace ด้วย RPC Function
  getWorkspaceMembers: async (workspaceId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_workspace_members", {
      ws_id: workspaceId,
    });

    if (error) throw error;
    return data as TeamMember[];
  },

  // 2. ลบสมาชิกออกจาก Workspace
  removeMember: async (memberId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("id", memberId);

    if (error) throw error;
  },
};
