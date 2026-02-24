"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, UserPlus, Loader2, Layout } from "lucide-react";
import { useToast } from "@/components/shared/ToastProvider";
import { authService } from "@/services/authService";
// ✨ Import PostgrestError กรณีต้องการดัก Error โค้ดจาก Supabase (ถ้ามี)
import { AuthError } from "@supabase/supabase-js";

export default function AuthPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // ตรวจสอบ Password ให้ตรงกัน
        if (password !== confirmPassword) {
          throw new Error("รหัสผ่านไม่ตรงกัน");
        }

        // ✨ เรียกใช้ authService.signUp
        await authService.signUp(email, password);

        showToast(
          "Sign Up Success",
          "success",
          "สมัครสมาชิกสำเร็จ! โปรดเช็คอีเมลเพื่อยืนยันตัวตน",
        );

        // สลับกลับมาหน้า Login ปกติเพื่อให้ผู้ใช้เตรียมเข้าสู่ระบบ
        setIsSignUp(false);
        setPassword("");
        setConfirmPassword("");
      } else {
        // ✨ เรียกใช้ authService.signIn
        await authService.signIn(email, password);

        showToast(
          "Login Success",
          "success",
          "เข้าสู่ระบบสำเร็จ กำลังพาคุณเข้าสู่ระบบ...",
        );
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      // ✨ ใช้ Type Assertion สำหรับ AuthError
      const error = err as AuthError | Error;
      const message =
        error.message === "Invalid login credentials"
          ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
          : error.message;

      showToast(isSignUp ? "Sign Up Failed" : "Login Failed", "error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-slate-800">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-blue-600 p-3 rounded-2xl text-white mb-4 shadow-lg shadow-blue-100">
            <Layout size={32} />
          </div>
          <h1 className="text-2xl font-black italic tracking-tight">
            {isSignUp ? "สร้างบัญชีใหม่" : "ยินดีต้อนรับกลับมา"}
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            จัดการงานของคุณให้เป็นระบบกับ Cyne
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase ml-1">
              อีเมล
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                required
                type="email"
                placeholder="email@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 font-bold outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase ml-1">
              รหัสผ่าน
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 font-bold outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Confirm Password (เฉพาะตอนสมัคร) */}
          {isSignUp && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase ml-1">
                ยืนยันรหัสผ่าน
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 font-bold outline-none transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black text-sm uppercase tracking-wider py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : isSignUp ? (
              <UserPlus size={18} />
            ) : (
              <LogIn size={18} />
            )}
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="text-center mt-8">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              // เคลียร์ค่ารหัสผ่านเมื่อสลับโหมด
              setPassword("");
              setConfirmPassword("");
            }}
            className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-wide"
          >
            {isSignUp
              ? "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ"
              : "ยังไม่มีบัญชี? สมัครสมาชิก"}
          </button>
        </div>
      </div>
    </div>
  );
}
