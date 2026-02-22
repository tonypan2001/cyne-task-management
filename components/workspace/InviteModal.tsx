'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, UserPlus, X, Loader2, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/shared/ToastProvider'

interface InviteModalProps {
    isOpen: boolean
    onClose: () => void
    workspaceId: string
}

export const InviteModal = ({ isOpen, onClose, workspaceId }: InviteModalProps) => {
    const supabase = createClient()
    const { showToast } = useToast()

    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState<{ id: string, email: string }[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [isInviting, setIsInviting] = useState(false)

    // ✨ ระบบ Auto-complete: ค้นหาทันทีที่พิมพ์ (พร้อมหน่วงเวลา Debounce เล็กน้อยไม่ให้ยิง API รัวไป)
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([])
            return
        }

        const delaySearch = setTimeout(async () => {
            setIsSearching(true)
            try {
                // เรียกใช้ฟังก์ชัน SQL ที่เราเพิ่งสร้างไป
                const { data, error } = await supabase.rpc('search_users_by_email', {
                    search_term: searchTerm
                })

                if (error) throw error
                setSearchResults(data || [])
            } catch (err) {
                console.error('Search error:', err)
            } finally {
                setIsSearching(false)
            }
        }, 300) // หน่วง 300ms 

        return () => clearTimeout(delaySearch)
    }, [searchTerm, supabase])

    const handleInvite = async (userId: string, email: string) => {
        setIsInviting(true)
        try {
            const { error } = await supabase
                .from('workspace_members')
                .insert({
                    workspace_id: workspaceId,
                    user_id: userId,
                    role: 'member'
                })

            if (error) {
                if (error.code === '23505') {
                    showToast('Already a member', 'warning', `${email} อยู่ในพื้นที่ทำงานนี้อยู่แล้ว`)
                } else {
                    throw error
                }
                return
            }

            showToast('User Added', 'success', `เพิ่ม ${email} เข้าสู่ Workspace สำเร็จแล้ว`)
            setSearchTerm('')
            onClose()
        } catch (_) {
            if (_) showToast('Failed to add user', 'error', 'ไม่สามารถเพิ่มผู้ใช้ได้')
        } finally {
            setIsInviting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 bg-slate-50 rounded-full transition-colors">
                    <X size={16} />
                </button>

                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-100 p-2.5 rounded-2xl text-blue-600">
                        <UserPlus size={20} />
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-800">Invite Team</h3>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8 ml-1">ค้นหาอีเมลเพื่อเพิ่มทีมเวิร์คเข้าโปรเจกต์</p>

                {/* 🛠️ ครอบก้อนนี้ด้วย relative เพื่อให้ Dropdown อิงตำแหน่งจากก้อนนี้ */}
                <div className="relative">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                            autoFocus
                            type="email"
                            placeholder="Type user email..."
                            className="w-full bg-slate-50 pl-12 pr-6 py-4 rounded-2xl border-none outline-none font-bold text-sm focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {isSearching && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={16} />}
                    </div>

                    {/* ✨ Auto-complete Dropdown Results (เปลี่ยนเป็น absolute และ z-50) */}
                    {searchTerm.trim() && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden max-h-60 overflow-y-auto z-50">
                            {searchResults.length > 0 ? (
                                searchResults.map((user) => (
                                    <button
                                        key={user.id}
                                        disabled={isInviting}
                                        onClick={() => handleInvite(user.id, user.email)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group text-left"
                                    >
                                        <div className="flex items-center gap-3 truncate">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs shrink-0">
                                                {user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 truncate">{user.email}</span>
                                        </div>
                                        <CheckCircle2 size={16} className="text-slate-200 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                                    </button>
                                ))
                            ) : (
                                !isSearching && (
                                    <div className="p-6 text-center text-xs font-bold text-slate-400 italic">
                                        ไม่พบผู้ใช้งานนี้ในระบบ
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}