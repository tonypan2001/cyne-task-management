"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ArrowLeftRight, Briefcase, UserPlus, Trash2 } from "lucide-react";
import { InviteModal } from "../workspace/InviteModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { useToast } from "@/components/shared/ToastProvider";
import { workspaceService } from "@/services/workspaceService";

export const TopBar = () => {
  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();

  const [workspaceName, setWorkspaceName] = useState<string>("Loading...");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // State สำหรับเช็คสิทธิ์ Owner
  const [isOwner, setIsOwner] = useState(false);

  // Modal States
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchWorkspace = async () => {
      const wsId = localStorage.getItem("active_workspace_id");
      if (!wsId) {
        setWorkspaceName("No Workspace Selected");
        return;
      }

      setWorkspaceId(wsId);

      try {
        // ดึงข้อมูล User ปัจจุบัน
        const { data: userData } = await supabase.auth.getUser();

        // ใช้ Service ดึงข้อมูล Workspace
        const wsData = await workspaceService.getWorkspaceById(wsId);

        if (wsData) {
          setWorkspaceName(wsData.name);
          // ตรวจสอบว่า User ปัจจุบัน เป็นเจ้าของ (user_id) ของ Workspace นี้หรือไม่
          setIsOwner(wsData.user_id === userData.user?.id);
        }
      } catch (err) {
        console.error("Error fetching workspace for TopBar:", err);
        setWorkspaceName("Unknown Workspace");
      }
    };

    fetchWorkspace();
  }, [supabase]);

  // ฟังก์ชันจัดการการลบ Workspace
  const handleDeleteWorkspace = async () => {
    if (!workspaceId) return;
    setIsDeleting(true);

    try {
      await workspaceService.deleteWorkspace(workspaceId);

      showToast("Workspace Deleted", "success", "ลบพื้นที่ทำงานเรียบร้อยแล้ว");

      // ล้างค่าที่จำไว้แล้วส่งกลับไปหน้าเลือก Workspace
      localStorage.removeItem("active_workspace_id");
      router.push("/workspaces");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบ";
      showToast("Delete Failed", "error", msg);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <div className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-10 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl shadow-inner">
            <Briefcase size={16} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Current Workspace
            </p>
            <h2 className="text-sm font-black text-slate-800 italic tracking-tight">
              {workspaceName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 1. ปุ่ม Switch */}
          <Link
            href="/workspaces"
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
          >
            <ArrowLeftRight size={14} />
            <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">
              Switch
            </span>
          </Link>

          {/* 2. ปุ่ม Invite */}
          {workspaceId && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
            >
              <UserPlus size={14} />
              <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">
                Invite
              </span>
            </button>
          )}

          {/* 3. เส้นคั่นและปุ่ม Delete (แสดงเฉพาะ Owner) */}
          {workspaceId && isOwner && (
            <>
              {/* ✨ เส้นคั่น Vertical Divider */}
              <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

              {/* ✨ ปุ่ม Delete ย้ายมาอยู่ขวาสุด */}
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                title="Delete Workspace"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">
                  Delete Workspace
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* โหลด Modal (ซ่อนอยู่จนกว่าจะถูกเรียก) */}
      {workspaceId && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          workspaceId={workspaceId}
        />
      )}

      {workspaceId && isOwner && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteWorkspace}
          isLoading={isDeleting}
          title="Delete Workspace?"
          description={`การกระทำนี้ไม่สามารถย้อนกลับได้ โปรเจกต์ งาน และข้อมูลทั้งหมดใน "${workspaceName}" จะถูกลบอย่างถาวร`}
          confirmText="Yes, Delete Workspace"
          verifyText={workspaceName}
        />
      )}
    </>
  );
};
