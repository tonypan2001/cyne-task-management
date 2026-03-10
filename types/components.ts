// types/components.ts

export interface AssigneeDropdownProps {
  workspaceId: string;
  value: string | null; // เก็บชื่อหรืออีเมลคนที่ถูก Assign
  onChange: (name: string | null) => void;
}
