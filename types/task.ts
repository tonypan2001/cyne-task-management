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