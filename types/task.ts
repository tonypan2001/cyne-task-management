export interface Project {
    id: string;
    name: string;
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
    creator_name: string | null;
    assignee_name: string | null;
    is_completed: boolean;
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
    due_date: string; // เพิ่มฟิลด์นี้ค่ะ
}

export interface TaskFormProps {
    initialData?: Partial<TaskFormData>;
    projects: Project[];
    onSubmit: (data: TaskFormData) => void;
    loading: boolean;
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