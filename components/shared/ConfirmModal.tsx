'use client'

import { ConfirmModalProps } from '@/types/confirmModal'
import { AlertTriangle } from 'lucide-react'

export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = true,
    isLoading = false
}: ConfirmModalProps) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Background Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => !isLoading && onClose()}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 ${isDanger ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                        <AlertTriangle size={32} />
                    </div>

                    <h3 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter mb-2">
                        {title}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-8 whitespace-pre-line">
                        {description}
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            disabled={isLoading}
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-30"
                        >
                            {cancelText}
                        </button>
                        <button
                            disabled={isLoading}
                            onClick={onConfirm}
                            className={`flex-1 py-4 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all disabled:opacity-50 ${isDanger ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-slate-900 hover:bg-blue-600 shadow-slate-100'
                                }`}
                        >
                            {isLoading ? 'Processing...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}