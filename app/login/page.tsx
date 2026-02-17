'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Mail, Lock, LogIn, UserPlus, Loader2, Layout } from 'lucide-react'

export default function AuthPage() {
    const supabase = createClient()
    const router = useRouter()

    const [isSignUp, setIsSignUp] = useState(false)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isSignUp) {
                // ตรวจสอบ Password ให้ตรงกัน
                if (password !== confirmPassword) {
                    throw new Error('รหัสผ่านไม่ตรงกันค่ะ')
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                alert('สมัครสมาชิกสำเร็จ! โปรดเช็คอีเมลเพื่อยืนยันตัวตนนะคะ')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.push('/')
                router.refresh()
            }
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดค่ะ')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-slate-800">
            <div className="max-w-md w-full bg-white rounded-4xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">

                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex bg-blue-600 p-3 rounded-2xl text-white mb-4 shadow-lg shadow-blue-100">
                        <Layout size={32} />
                    </div>
                    <h1 className="text-2xl font-bold">{isSignUp ? 'สร้างบัญชีใหม่' : 'ยินดีต้อนรับกลับมาค่ะ'}</h1>
                    <p className="text-slate-400 text-sm mt-2">จัดการงานของคุณให้เป็นระบบกับ Cyne</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">อีเมล</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                required
                                type="email"
                                placeholder="email@example.com"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">รหัสผ่าน</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                required
                                type="password"
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Confirm Password (เฉพาะตอนสมัคร) */}
                    {isSignUp && (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">ยืนยันรหัสผ่าน</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />)}
                        {loading ? 'โปรดรอสักครู่...' : (isSignUp ? 'สร้างบัญชี' : 'เข้าสู่ระบบ')}
                    </button>
                </form>

                {/* Switch Mode */}
                <div className="text-center mt-8">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        {isSignUp ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่' : 'ยังไม่มีบัญชี? สมัครสมาชิกใหม่'}
                    </button>
                </div>
            </div>
        </div>
    )
}