export interface Project {
    id: string;
    name: string;
    user_id?: string;
    workspace_id: string;
}

export interface SubTask {
    id: string;
    task_id: string;
    title: string;
    is_completed: boolean;
}

export interface Task {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    image_url: string | null;
    created_at: string;
    user_id: string;
    project_id: string | null;
    workspace_id: string;
    creator_name: string | null;
    assignee_name: string | null;
    is_completed: boolean;
    due_date: string | null;
    priority: 'High' | 'Medium' | 'Low' | null;
}

export interface TaskComment {
    id: string;
    task_id: string;
    user_id: string;
    content: string;
    created_at: string;
}

export interface TaskFormData {
    title: string;
    description: string;
    selectedProjectId: string;
    assigneeName: string;
    subTasks: { id?: string; title: string }[]; // เพิ่ม id เพื่อเช็คว่าเป็นงานเก่าหรือใหม่
    imageFile: File | null;
    image_url?: string;
    due_date: string; // เพิ่มฟิลด์นี้ค่ะ
    priority: 'High' | 'Medium' | 'Low';
}

export interface TaskFormProps {
    initialData?: Partial<TaskFormData>;
    projects: Project[];
    onSubmit: (data: TaskFormData) => void;
    loading: boolean;
    onAddProject?: (name: string) => Promise<string | null | undefined>;
    onDeleteProject?: (id: string) => Promise<boolean>;
}

export interface TaskStatusCardProps {
    isCompleted: boolean;
    progress: number;
    onToggle: () => void;
}

export interface DiscussionBoardProps {
    comments: TaskComment[];
    onSendMessage: (content: string) => void;
    loading: boolean;
}

export interface Workspace {
    id: string;
    name: string;
    description?: string;
    user_id: string;
    created_at: string;
}