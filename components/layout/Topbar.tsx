'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ArrowLeftRight, Briefcase } from 'lucide-react'

export const TopBar = () => {
    const supabase = createClient()
    const [workspaceName, setWorkspaceName] = useState<string>('Loading...')

    useEffect(() => {
        const fetchWorkspace = async () => {
            const wsId = localStorage.getItem('active_workspace_id')
            if (!wsId) {
                setWorkspaceName('No Workspace Selected')
                return
            }

            const { data } = await supabase
                .from('workspaces')
                .select('name')
                .eq('id', wsId)
                .single()

            if (data) {
                setWorkspaceName(data.name)
            } else {
                setWorkspaceName('Unknown Workspace')
            }
        }

        fetchWorkspace()
    }, [supabase])

    return (
        <div className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-10 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl shadow-inner">
                    <Briefcase size={16} />
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Workspace</p>
                    <h2 className="text-sm font-black text-slate-800 italic tracking-tight">{workspaceName}</h2>
                </div>
            </div>

            <Link
                href="/workspaces"
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
            >
                <ArrowLeftRight size={14} />
                <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Switch Workspace</span>
            </Link>
        </div>
    )
}