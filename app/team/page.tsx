'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Users, UserMinus, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { useToast } from '@/components/shared/ToastProvider'
import { ConfirmModal } from '@/components/shared/ConfirmModal'

// สร้าง Type สำหรับรับค่าจาก SQL Function ของเรา
interface TeamMember {
    member_id: string
    user_id: string
    email: string
    role: string
    joined_at: string
}

export default function TeamPage() {
    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()

    const [workspaceId, setWorkspaceId] = useState<string | null>(null)
    const [members, setMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)

    // Modal States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null)
    const [isRemoving, setIsRemoving] = useState(false)

    useEffect(() => {
        const activeId = localStorage.getItem('active_workspace_id')
        if (!activeId) {
            router.push('/workspaces')
            return
        }
        setWorkspaceId(activeId)
    }, [router])

    const fetchMembers = useCallback(async () => {
        if (!workspaceId) return
        try {
            // ✨ เรียกใช้ SQL Function ที่เราเพิ่งสร้าง
            const { data, error } = await supabase.rpc('get_workspace_members', {
                ws_id: workspaceId
            })

            if (error) throw error
            if (data) setMembers(data as TeamMember[])
        } catch (_) {
            if (_) showToast('Error', 'error', 'ไม่สามารถโหลดรายชื่อทีมได้')
        } finally {
            setLoading(false)
        }
    }, [workspaceId, supabase, showToast])

    useEffect(() => {
        if (workspaceId) {
            fetchMembers()
        }
    }, [workspaceId, fetchMembers])

    const handleRemoveClick = (member: TeamMember) => {
        if (member.role === 'owner') {
            showToast('Permission Denied', 'warning', 'ไม่สามารถลบ Owner ออกจากพื้นที่ทำงานได้')
            return
        }
        setMemberToRemove(member)
        setIsDeleteModalOpen(true)
    }

    const confirmRemoveMember = async () => {
        if (!memberToRemove) return
        setIsRemoving(true)

        try {
            const { error } = await supabase
                .from('workspace_members')
                .delete()
                .eq('id', memberToRemove.member_id) // ลบจาก ID ของตารางสมาชิก

            if (error) throw error

            setMembers(prev => prev.filter(m => m.member_id !== memberToRemove.member_id))
            showToast('Member Removed', 'success', `นำ ${memberToRemove.email} ออกจากทีมเรียบร้อยแล้ว`)
            setIsDeleteModalOpen(false)
        } catch (_) {
            if (_) showToast('Failed to remove', 'error', 'เกิดข้อผิดพลาดในการลบสมาชิก')
        } finally {
            setIsRemoving(false)
            setMemberToRemove(null)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 gap-4">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <p className="font-black text-[10px] uppercase tracking-widest">Loading Team...</p>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 animate-in fade-in duration-700">
            <PageHeader
                title="Team Management"
                subtitle="จัดการรายชื่อสมาชิกในพื้นที่ทำงานนี้"
                icon={<Users size={16} />}
            />

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden mt-10">
                <div className="p-8 md:p-10 border-b border-slate-50">
                    <h2 className="text-xl font-black text-slate-800 italic tracking-tighter uppercase">Members ({members.length})</h2>
                </div>

                <div className="divide-y divide-slate-50">
                    {members.map((member) => (
                        <div key={member.member_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-8 md:px-10 gap-4 hover:bg-slate-50/50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-lg shrink-0 shadow-inner">
                                    {member.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700">{member.email}</h3>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] font-black uppercase tracking-widest">
                                        {member.role === 'owner' ? (
                                            <span className="text-blue-500 flex items-center gap-1"><ShieldCheck size={12} /> Owner</span>
                                        ) : (
                                            <span className="text-slate-400 flex items-center gap-1"><ShieldAlert size={12} /> Member</span>
                                        )}
                                        <span className="text-slate-300 mx-1">•</span>
                                        <span className="text-slate-400">Joined {new Date(member.joined_at).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ซ่อนปุ่มลบถ้าคนนั้นเป็น Owner */}
                            {member.role !== 'owner' && (
                                <button
                                    onClick={() => handleRemoveClick(member)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 sm:ml-auto"
                                >
                                    <UserMinus size={14} /> Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmRemoveMember}
                isLoading={isRemoving}
                title="Remove Member?"
                description={`คุณแน่ใจนะว่าจะนำ ${memberToRemove?.email} ออกจากพื้นที่ทำงานนี้?\nงานที่เขารับผิดชอบอยู่จะยังคงอยู่ แต่เขาจะไม่สามารถเข้าถึง Workspace นี้ได้อีก`}
                confirmText="Yes, Remove"
            />
        </div>
    )
}