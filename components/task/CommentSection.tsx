'use client'
import { MessageSquare, Send, Clock } from 'lucide-react'
import { TaskComment } from '@/types/task'
import { useState } from 'react'

export const CommentSection = ({ comments, onSend }: { comments: TaskComment[], onSend: (val: string) => void, isSending: boolean }) => {
    const [text, setText] = useState('')
    return (
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl flex flex-col h-[550px]">
            <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2"><MessageSquare size={18} className="text-blue-500" /> Discussion</h3>
            <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 scrollbar-hide">
                {comments.map(c => (
                    <div key={c.id} className="bg-slate-50 p-5 rounded-3xl rounded-tl-none border border-slate-100">
                        <p className="text-xs text-slate-600 font-medium">{c.content}</p>
                        <div className="flex items-center gap-1 mt-3 text-[8px] text-slate-300 font-bold uppercase"><Clock size={10} /> {new Date(c.created_at).toLocaleTimeString()}</div>
                    </div>
                ))}
            </div>
            <div className="relative">
                <input className="w-full pl-6 pr-14 py-5 bg-slate-50 border-none rounded-3xl outline-none text-xs font-semibold" value={text} onChange={e => setText(e.target.value)} />
                <button onClick={() => { onSend(text); setText('') }} className="absolute right-3 top-2 p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200"><Send size={14} /></button>
            </div>
        </div>
    )
}