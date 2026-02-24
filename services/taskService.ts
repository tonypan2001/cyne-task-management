import { createClient } from '@/lib/supabase'
import { Task } from '@/types/task'

export const taskService = {
    // ดึงงานทั้งหมดใน Workspace
    getTasksByWorkspace: async (workspaceId: string) => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as Task[]
    },

    // (ในอนาคตเราจะเอาฟังก์ชันลบงาน หรืออัปเดตสถานะมาใส่ตรงนี้เพิ่มค่ะ)
}