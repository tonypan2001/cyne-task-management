# Cyne - Modern Workspace & Task Management 🚀

Cyne (Cynetask) is a modern, fast, and collaborative task management application built with Next.js and Supabase. It allows teams to organize tasks, manage granular permissions, and track progress across multiple workspaces seamlessly.

<img width="1792" height="1069" alt="Screenshot 2569-03-10 at 16 58 37" src="https://github.com/user-attachments/assets/39b588b6-0414-4fe0-a634-e8eccb360312" />

<img width="1792" height="1069" alt="Screenshot 2569-03-10 at 17 01 47" src="https://github.com/user-attachments/assets/b8013b5c-c8b4-4dec-9c99-7950235502a9" />

## ✨ Key Features

* **🏢 Workspace Management:** Create, switch, rename, and securely delete workspaces to keep projects isolated.
* **👥 Granular Team Permissions:** Manage team members with specific roles (Owner/Member) and toggleable permissions (e.g., `can_invite`, `can_create_task`).
* **📋 Advanced Task Creation:**
    * Rich text descriptions.
    * Smart Assignee Dropdown (Searchable).
    * Priority levels (High, Medium, Low) and Deadlines.
    * Sub-tasks (Roadmap steps) within a main task.
    * Image attachments with preview.
* **📊 Dynamic Dashboard:** Weekly agenda views, urgent task highlights, and interactive task cards.
* **🔒 Secure Authentication:** Powered by Supabase Auth with Row Level Security (RLS) to ensure data privacy.

## 📊 System Use Case Diagram

Here is a high-level overview of the user roles and their permissions within a workspace:

```mermaid
flowchart LR
    %% Actors
    Owner([👑 Workspace Owner])
    Member([👤 Workspace Member])

    %% System Boundary
    subgraph Cyne Application
        direction TB
        
        subgraph Workspace Management
            CreateWS(Create Workspace)
            DeleteWS(Delete Workspace)
            SwitchWS(Switch Workspace)
            RenameWS(Rename Workspace)
        end
        
        subgraph Team Management
            ManagePerm(Manage Permissions)
            RemoveMem(Remove Member)
            InviteMem(Invite New Member)
        end
        
        subgraph Task Management
            CreateTask(Create Task & Subtasks)
            AssignTask(Assign Members)
            UpdateStatus(Update Task Status)
        end
    end

    %% Owner Relationships (Full Access)
    Owner ---> CreateWS
    Owner ---> DeleteWS
    Owner ---> SwitchWS
    Owner ---> RenameWS
    Owner ---> ManagePerm
    Owner ---> RemoveMem
    Owner ---> InviteMem
    Owner ---> CreateTask
    Owner ---> AssignTask
    Owner ---> UpdateStatus

    %% Member Relationships (Restricted Access)
    Member ---> SwitchWS
    Member -.->|If can_invite = true| InviteMem
    Member -.->|If can_create_task = true| CreateTask
    Member ---> AssignTask
    Member ---> UpdateStatus
    
    classDef default fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px,color:#334155;
    classDef actor fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,color:#1e40af,font-weight:bold;
    class Owner,Member actor;
```

## 🛠️ Tech Stack

* **Framework:** [Next.js (App Router)](https://nextjs.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/your-username/cyne.git
cd cyne
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
# or yarn install / pnpm install
\`\`\`

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
\`\`\`

*(⚠️ Note: Never commit your actual `.env.local` file to GitHub!)*

### 4. Database Setup (Supabase)
This project requires specific database tables and SQL functions. Run the SQL scripts provided in the `/supabase/setup.sql` file in your Supabase SQL Editor to initialize:
* `workspaces` and `workspace_members` tables.
* `can_invite` and `can_create_task` columns.
* The `get_workspace_members` RPC function.

### 5. Run the development server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 👨‍💻 Author

**Prompan Uechanwech (Pan)**
* Frontend Developer
* GitHub: [@tonypan2001](https://github.com/tonypan2001)
