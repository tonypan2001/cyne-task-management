'use client'
import { useState } from 'react'
import { MessageSquare, Send, Clock, User } from 'lucide-react'
import { DiscussionBoardProps } from '@/types/task'



export const DiscussionBoard = ({ comments, onSendMessage, loading }: DiscussionBoardProps) => {
    const [text, setText] = useState('')

    const handleSend = () => {
        if (!text.trim()) return
        onSendMessage(text)
        setText('')
    }

    return (
        <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-xl flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-800 flex items-center gap-3 italic">
                    <div className="bg-blue-50 p-2 rounded-xl text-blue-500"><MessageSquare size={18} /></div>
                    Discussion
                </h3>
                <span className="text-[10px] font-black text-slate-300 uppercase">{comments.length} Messages</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 scrollbar-hide">
                {comments.length > 0 ? comments.map((c) => (
                    <div key={c.id} className="group animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-black">
                                <User size={12} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Member</span>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-[1.8rem] rounded-tl-none border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{c.content}</p>
                            <div className="flex items-center gap-1 mt-4 text-[8px] text-slate-300 font-black uppercase">
                                <Clock size={10} /> {new Date(c.created_at).toLocaleString('th-TH')}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-200">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">No conversation yet</p>
                    </div>
                )}
            </div>

            <div className="relative group">
                <input
                    placeholder="Write a message..."
                    className="w-full pl-6 pr-16 py-5 bg-slate-50 border-none rounded-[1.8rem] outline-none text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !text.trim()}
                    className="absolute right-2 top-2 p-4 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    )
}