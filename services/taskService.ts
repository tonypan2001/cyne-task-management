import { createClient } from "@/lib/supabase";
import { Task } from "@/types/task";

export const taskService = {
  // 1. ดึงงานทั้งหมดใน Workspace
  getTasksByWorkspace: async (workspaceId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Task[];
  },

  // 2. ดึงข้อมูลงาน 1 ชิ้นตาม ID
  getTaskById: async (taskId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*, sub_tasks(*)")
      .eq("id", taskId)
      .single();

    if (error) throw error;
    return data as Task;
  },

  // 3. อัปโหลดรูปภาพ
  uploadImage: async (userId: string, file: File) => {
    const supabase = createClient();
    const fileName = `${userId}/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage
      .from("task-images")
      .upload(fileName, file);

    if (error) throw error;
    return supabase.storage.from("task-images").getPublicUrl(fileName).data
      .publicUrl;
  },

  // 4. สร้างงานใหม่ (พร้อม Sub-tasks)
  createTask: async (
    taskData: Partial<Task>,
    subTasks: { title: string }[],
  ) => {
    const supabase = createClient();
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert(taskData)
      .select()
      .single();

    if (taskError) throw taskError;

    // สร้าง Sub-tasks ถ้ามี
    if (subTasks.length > 0 && task) {
      const { error: subError } = await supabase
        .from("sub_tasks")
        .insert(subTasks.map((st) => ({ task_id: task.id, title: st.title })));
      if (subError) throw subError;
    }

    return task;
  },

  // 5. อัปเดตงานและ Sub-tasks
  updateTask: async (
    taskId: string,
    updateData: Partial<Task>,
    subTasks: { title: string }[],
  ) => {
    const supabase = createClient();
    const { error: taskError } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", taskId);

    if (taskError) throw taskError;

    // เคลียร์ Sub-tasks เดิมและใส่ใหม่
    await supabase.from("sub_tasks").delete().eq("task_id", taskId);
    if (subTasks.length > 0) {
      const { error: subError } = await supabase
        .from("sub_tasks")
        .insert(subTasks.map((st) => ({ task_id: taskId, title: st.title })));
      if (subError) throw subError;
    }
  },

  // 6. ลบงาน
  deleteTask: async (taskId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) throw error;
  },

  // ✨ 7. ดึงเฉพาะงานที่เสร็จแล้วใน Workspace
  getCompletedTasksByWorkspace: async (workspaceId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("is_completed", true) // เปลี่ยนกลับมาใช้ is_completed ตามโครงสร้างเดิม
      .order("created_at", { ascending: false }); // เปลี่ยนกลับมาใช้ created_at

    if (error) throw error;
    return data as Task[];
  },

  // ✨ 8. อัปเดตสถานะงาน (เช่น Restore กลับไป In Progress)
  updateTaskStatus: async (taskId: string) => {
    const supabase = createClient();

    const { error } = await supabase
      .from("tasks")
      .update({
        // status: newStatus, // 💡 Ray ขอคอมเมนต์บรรทัดนี้ปิดไว้ก่อนนะคะ ป้องกัน Error กรณีไม่มีคอลัมน์นี้ใน DB
        is_completed: false, // ✨ สั่งให้สถานะ "เสร็จสิ้น" กลับไปเป็น "ยังไม่เสร็จ"
      })
      .eq("id", taskId);

    if (error) throw error;
  },
};
