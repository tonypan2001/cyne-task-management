'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Users, UserMinus, ShieldAlert, ShieldCheck, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { useToast } from '@/components/shared/ToastProvider'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { teamService } from '@/services/teamService'
import { TeamMember } from '@/types/team'

export default function TeamPage() {
    const router = useRouter()
    const { showToast } = useToast()

    const [workspaceId, setWorkspaceId] = useState<string | null>(null)
    const [members, setMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)

    // ✨ State สำหรับควบคุมการเปิด/ปิด Dropdown Permission
    const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null)

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
            const data = await teamService.getWorkspaceMembers(workspaceId)
            setMembers(data)
        } catch (_) {
            if (_) showToast('Error', 'error', 'ไม่สามารถโหลดรายชื่อทีมได้')
        } finally {
            setLoading(false)
        }
    }, [workspaceId, showToast])

    useEffect(() => {
        if (workspaceId) {
            fetchMembers()
        }
    }, [workspaceId, fetchMembers])

    const handleRemoveClick = (e: React.MouseEvent, member: TeamMember) => {
        e.stopPropagation() // ป้องกันไม่ให้การกดปุ่มลบไปเปิด Dropdown
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
            await teamService.removeMember(memberToRemove.member_id)
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

    // ✨ ฟังก์ชันสลับการเปิด/ปิด Dropdown
    const toggleExpand = (memberId: string) => {
        setExpandedMemberId(prev => prev === memberId ? null : memberId)
    }

    // ✨ ฟังก์ชันจัดการเวลาสับสวิตช์ Permission
    const handleTogglePermission = async (memberId: string, field: 'can_invite' | 'can_create_task', currentValue: boolean) => {
        const newValue = !currentValue
        
        // Optimistic UI: เปลี่ยนที่หน้าจอก่อนเพื่อให้รู้สึกรวดเร็ว
        setMembers(prev => prev.map(m => m.member_id === memberId ? { ...m, [field]: newValue } : m))

        try {
            await teamService.updatePermission(memberId, field, newValue)
            showToast('Permission Updated', 'success', 'อัปเดตสิทธิ์การใช้งานเรียบร้อยแล้ว')
        } catch (err) {
            // ถ้าเซิร์ฟเวอร์พัง ให้เปลี่ยนค่ากลับ
            if (err)
            {
              setMembers(prev => prev.map(m => m.member_id === memberId ? { ...m, [field]: currentValue } : m))
              showToast('Update Failed', 'error', 'ไม่สามารถอัปเดตสิทธิ์ได้')
            }
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
                subtitle="จัดการรายชื่อและสิทธิ์การเข้าถึงของสมาชิก"
                icon={<Users size={16} />}
            />

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden mt-10">
                <div className="p-8 md:p-10 border-b border-slate-50">
                    <h2 className="text-xl font-black text-slate-800 italic tracking-tighter uppercase">Members ({members.length})</h2>
                </div>

                <div className="divide-y divide-slate-50">
                    {members.map((member) => (
                        <div key={member.member_id} className="group flex flex-col transition-colors">
                            {/* ✨ แถวหลัก (คลิกเพื่อขยาย Dropdown ได้) */}
                            <div 
                                onClick={() => toggleExpand(member.member_id)}
                                className={`flex flex-col sm:flex-row sm:items-center justify-between p-8 md:px-10 gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors ${expandedMemberId === member.member_id ? 'bg-slate-50/50' : ''}`}
                            >
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

                                <div className="flex items-center gap-3 sm:ml-auto">
                                    {/* ซ่อนปุ่มลบถ้าคนนั้นเป็น Owner */}
                                    {member.role !== 'owner' && (
                                        <button
                                            onClick={(e) => handleRemoveClick(e, member)}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        >
                                            <UserMinus size={14} /> Remove
                                        </button>
                                    )}
                                    {/* ไอคอนแสดงการเปิด/ปิด Dropdown */}
                                    <div className="w-8 h-8 flex items-center justify-center text-slate-300 bg-white border border-slate-100 rounded-lg shadow-sm">
                                        {expandedMemberId === member.member_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </div>
                            </div>

                            {/* ✨ ส่วนเนื้อหา Dropdown: ตารางจัดการ Permission */}
                            {expandedMemberId === member.member_id && (
                                <div className="px-8 md:px-10 pb-8 pt-2 bg-slate-50/50 animate-in slide-in-from-top-2 fade-in duration-200">
                                    {member.role === 'owner' ? (
                                        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3 text-blue-600">
                                            <ShieldCheck size={18} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">เจ้าของพื้นที่ทำงานมีสิทธิ์เข้าถึงทุกฟีเจอร์โดยอัตโนมัติ</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Permissions Control</h4>
                                            
                                            {/* สวิตช์: อนุญาตให้เชิญเพื่อน */}
                                            <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">Invite Members</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">อนุญาตให้สมาชิกคนนี้เชิญบุคคลอื่นเข้าสู่ Workspace ได้</p>
                                                </div>
                                                <button
                                                    onClick={() => handleTogglePermission(member.member_id, 'can_invite', member.can_invite || false)}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${member.can_invite ? 'bg-blue-600' : 'bg-slate-200'}`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${member.can_invite ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>

                                            {/* สวิตช์: อนุญาตให้สร้างงาน */}
                                            <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">Create Tasks & Assets</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">อนุญาตให้สมาชิกคนนี้สามารถสร้างและเพิ่มงานใหม่ลงในโปรเจกต์ได้</p>
                                                </div>
                                                <button
                                                    onClick={() => handleTogglePermission(member.member_id, 'can_create_task', member.can_create_task || false)}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${member.can_create_task ? 'bg-blue-600' : 'bg-slate-200'}`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${member.can_create_task ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
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