import { createClient } from "@/lib/supabase";

export const authService = {
  // 1. สมัครสมาชิก
  signUp: async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // เปลี่ยน redirect URL ให้กลับมาหน้าหลัก (หรือหน้าที่ต้องการ) หลังจากยืนยันอีเมล
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  },

  // 2. เข้าสู่ระบบ
  signIn: async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // 3. ออกจากระบบ (ทำเผื่อไว้สำหรับ TopBar)
  signOut: async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
