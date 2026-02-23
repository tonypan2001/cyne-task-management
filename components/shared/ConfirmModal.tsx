'use client'

import { useState } from 'react'
import { ConfirmModalProps } from '@/types/confirmModal'
import { AlertTriangle, Loader2 } from 'lucide-react'

export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = true,
    isLoading = false,
    verifyText
}: ConfirmModalProps) => {
    const [inputText, setInputText] = useState('')

    // ✨ 1. สร้างฟังก์ชันหุ้มการปิด Modal เพื่อเคลียร์ค่า Input ทันทีเมื่อกดปิด
    const handleClose = () => {
        setInputText('')
        onClose()
    }

    if (!isOpen) {
        // ✨ 2. ดักการเคลียร์ค่าในกรณีที่ Parent Component สั่งปิดจากภายนอก (หลีกเลี่ยง useEffect)
        if (inputText !== '') {
            setInputText('')
        }
        return null
    }

    const isConfirmDisabled = isLoading || (verifyText ? inputText !== verifyText : false)

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Background Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => !isLoading && handleClose()}
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
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-6 whitespace-pre-line">
                        {description}
                    </p>

                    {verifyText && (
                        <div className="w-full mb-8 text-left">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                                พิมพ์ <span className="text-slate-800 font-black">&quot;{verifyText}&quot;</span> เพื่อยืนยัน
                            </label>
                            <input
                                type="text"
                                className={`w-full bg-slate-50 px-6 py-4 rounded-2xl border-none outline-none font-bold text-sm text-center focus:ring-4 transition-all ${isDanger ? 'focus:ring-red-100' : 'focus:ring-blue-100'}`}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={verifyText}
                            />
                        </div>
                    )}

                    <div className="flex gap-3 w-full">
                        <button
                            disabled={isLoading}
                            onClick={handleClose} // ✨ เรียกใช้ handleClose แทน onClose
                            className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-30"
                        >
                            {cancelText}
                        </button>
                        <button
                            disabled={isConfirmDisabled}
                            onClick={() => {
                                onConfirm()
                                setInputText('') // ✨ เคลียร์ค่าเมื่อกดยืนยันสำเร็จ
                            }}
                            className={`flex-1 py-4 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50
                            ${isConfirmDisabled
                                    ? 'bg-slate-300 shadow-none cursor-not-allowed'
                                    : isDanger
                                        ? 'bg-red-500 hover:bg-red-600 shadow-red-100'
                                        : 'bg-slate-900 hover:bg-blue-600 shadow-slate-100'
                                }`}
                        >
                            {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                            {isLoading ? 'Processing...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}