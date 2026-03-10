// ✨ ย้าย Interface มาไว้ที่นี่ เพื่อให้เรียกใช้เป็นมาตรฐานเดียวกัน
export interface TeamMember {
  member_id: string;
  user_id: string;
  email: string;
  role: string;
  joined_at: string;
  can_invite?: boolean;
  can_create_task?: boolean;
}
