"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, ChevronDown, Check, UserPlus, X } from "lucide-react";
import { teamService } from "@/services/teamService";
import { TeamMember } from "@/types/team";
// ✨ Import Interface มาจากโฟลเดอร์ types
import { AssigneeDropdownProps } from "@/types/components";

export const AssigneeDropdown = ({
  workspaceId,
  value,
  onChange,
}: AssigneeDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ดึงรายชื่อสมาชิกใน Workspace
  useEffect(() => {
    const fetchMembers = async () => {
      if (!workspaceId) return;
      try {
        const data = await teamService.getWorkspaceMembers(workspaceId);
        setMembers(data);
      } catch (error) {
        console.error("Failed to load members:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [workspaceId]);

  // ปิด Dropdown เมื่อคลิกที่อื่น (Click Outside)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // กรองรายชื่อตามที่พิมพ์ค้นหา
  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    return members.filter((m) =>
      m.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [members, searchQuery]);

  const handleSelect = (email: string | null) => {
    onChange(email);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* ปุ่ม Trigger เปิด/ปิด Dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white px-5 py-3.5 rounded-2xl border border-slate-200 outline-none flex items-center justify-between hover:border-blue-300 transition-all shadow-sm group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] shrink-0 transition-colors ${
              value
                ? "bg-blue-100 text-blue-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {value ? value.charAt(0).toUpperCase() : <UserPlus size={14} />}
          </div>
          <span
            className={`text-sm font-bold truncate ${value ? "text-slate-700" : "text-slate-400"}`}
          >
            {value || "Assignee..."}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* เมนู Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* ช่องค้นหา */}
          <div className="p-3 border-b border-slate-50 relative">
            <Search
              size={14}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
            />
            <input
              type="text"
              placeholder="Search team members..."
              className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl border-none outline-none text-xs font-bold focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* รายชื่อ */}
          <div className="max-h-60 overflow-y-auto p-2 scrollbar-hide">
            {loading ? (
              <p className="text-center text-xs font-bold text-slate-300 py-6 uppercase tracking-widest">
                Loading...
              </p>
            ) : (
              <>
                {/* ตัวเลือก: ไม่มอบหมายงานให้ใคร (Unassigned) */}
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left group mb-1"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                    <X size={14} />
                  </div>
                  <span className="text-xs font-bold text-slate-500 group-hover:text-red-500 transition-colors">
                    Unassigned
                  </span>
                  {!value && (
                    <Check size={14} className="ml-auto text-blue-500" />
                  )}
                </button>

                {/* วนลูปรายชื่อสมาชิก */}
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <button
                      key={member.member_id}
                      type="button"
                      onClick={() => handleSelect(member.email)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px]">
                        {member.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-700 truncate">
                        {member.email}
                      </span>
                      {value === member.email && (
                        <Check
                          size={14}
                          className="ml-auto text-blue-500 shrink-0"
                        />
                      )}
                    </button>
                  ))
                ) : (
                  <p className="text-center text-xs font-bold text-slate-300 py-6 uppercase tracking-widest">
                    No members found
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
