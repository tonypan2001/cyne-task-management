"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Briefcase, Plus, LayoutGrid, Loader2, ArrowRight } from "lucide-react";
import { Workspace } from "@/types/task";
import { useToast } from "@/components/shared/ToastProvider";
import { workspaceService } from "@/services/workspaceService"; // ✨ Import Service

export default function WorkspaceSelectionPage() {
  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    try {
      // ✨ ใช้ Service ดึงข้อมูล Workspace
      const data = await workspaceService.getWorkspaces();
      setWorkspaces(data);
    } catch (_) {
      if (_) showToast("Error", "error", "ไม่สามารถโหลดข้อมูล Workspace ได้");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setIsCreating(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Unauthorized");

      // ✨ ใช้ Service สร้าง Workspace ใหม่
      const newWorkspace = await workspaceService.createWorkspace(
        newWorkspaceName.trim(),
        userData.user.id,
      );

      setWorkspaces([...workspaces, newWorkspace]);
      setNewWorkspaceName("");
      setIsModalOpen(false);
      showToast("Success", "success", "สร้างพื้นที่ทำงานใหม่เรียบร้อยแล้ว");
    } catch (_) {
      if (_) showToast("Creation Failed", "error", "ไม่สามารถสร้าง Workspace ได้");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectWorkspace = (workspaceId: string) => {
    localStorage.setItem("active_workspace_id", workspaceId);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-blue-600">
        <Loader2 size={32} className="animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Loading Workspaces...
        </p>
      </div>
    );
  }

  return (
    // ✨ ปรับแก้ Background ให้อยู่ใน Wrapper หลัก และใช้สี gradient ที่นุ่มนวลขึ้นครอบคลุมเต็มพื้นที่
    <div className="min-h-screen bg-linear-to-b from-blue-50 via-slate-50 to-slate-50 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* ✨ ตกแต่ง Background ด้วยวงกลมเบลอๆ เพิ่มความสวยงามสไตล์ Modern */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-5xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-200 mb-6 relative overflow-hidden">
            {/* เอฟเฟกต์สะท้อนแสงบนโลโก้ */}
            <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:animate-shimmer" />
            <LayoutGrid size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 italic tracking-tighter uppercase">
            Select Workspace
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            เลือกพื้นที่ทำงานที่คุณต้องการจัดการในขณะนี้
          </p>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => handleSelectWorkspace(ws.id)}
              className="group text-left bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 hover:border-blue-200 transition-all duration-300 flex flex-col h-64 relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-2xl flex items-center justify-center transition-colors mb-auto shadow-inner">
                <Briefcase size={20} />
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-black text-slate-800 italic tracking-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {ws.name}
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
                  Enter Workspace <ArrowRight size={12} />
                </p>
              </div>
            </button>
          ))}

          {/* Create New Card */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-100/30 backdrop-blur-sm border-2 border-dashed border-slate-200 p-8 rounded-[2.5rem] flex flex-col items-center justify-center h-64 hover:bg-white hover:border-blue-300 hover:shadow-xl transition-all duration-300 group text-center"
          >
            <div className="w-12 h-12 bg-white text-slate-300 group-hover:text-blue-600 rounded-2xl flex items-center justify-center shadow-sm mb-4 transition-colors">
              <Plus size={24} strokeWidth={3} />
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
              Create New
              <br />
              Workspace
            </h3>
          </button>
        </div>
      </div>

      {/* Create Workspace Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
            onClick={() => !isCreating && setIsModalOpen(false)}
          />
          <form
            onSubmit={handleCreateWorkspace}
            className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95"
          >
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-800 mb-2">
              New Workspace
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">
              ตั้งชื่อพื้นที่ทำงานใหม่เพื่อแยกโปรเจกต์ของคุณ
            </p>

            <input
              autoFocus
              type="text"
              placeholder="e.g., inko. Website Design"
              className="w-full bg-slate-50 px-6 py-5 rounded-2xl border-none outline-none font-bold text-sm focus:ring-4 focus:ring-blue-100 transition-all mb-8"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isCreating}
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !newWorkspaceName.trim()}
                className="flex-1 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-200 hover:bg-slate-900 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isCreating && <Loader2 size={14} className="animate-spin" />}
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
