import { createClient } from "@/lib/supabase";
import { TeamMember } from "@/types/team";

export const teamService = {
  // 1. ดึงรายชื่อสมาชิกทีม
  getWorkspaceMembers: async (workspaceId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_workspace_members", {
      ws_id: workspaceId,
    });

    if (error) throw error;
    return data as TeamMember[];
  },

  // 2. ลบสมาชิกออกจากทีม
  removeMember: async (memberId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("id", memberId);

    if (error) throw error;
  },

  // 3. ✨ ฟังก์ชันสำหรับอัปเดต Permission (เปิด-ปิดสวิตช์)
  updatePermission: async (
    memberId: string,
    field: "can_invite" | "can_create_task",
    value: boolean,
  ) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("workspace_members")
      .update({ [field]: value })
      .eq("id", memberId);

    if (error) throw error;
  },
};
