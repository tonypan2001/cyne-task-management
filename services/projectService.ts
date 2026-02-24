import { createClient } from '@/lib/supabase'
import { Project } from '@/types/task'

export const projectService = {
    // ดึงโปรเจกต์ทั้งหมดใน Workspace
    getProjectsByWorkspace: async (workspaceId: string) => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('name')

        if (error) throw error
        return data as Project[]
    }
}