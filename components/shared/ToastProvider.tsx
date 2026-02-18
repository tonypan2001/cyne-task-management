'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastMessage, NotificationType, ToastContextType } from '@/types/notification';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((title: string, type: NotificationType, description?: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, title, type, description }]);

        // ตั้งเวลาลบ Toast ออกหลังจาก 4 วินาทีค๊ะ
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Container สำหรับวาง Toast ไว้มุมขวาบน */}
            <div className="fixed top-6 right-6 z-110 flex flex-col gap-3 w-full max-w-xs pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="pointer-events-auto bg-white border border-slate-100 rounded-3xl p-4 shadow-2xl shadow-slate-200/50 flex items-start gap-4 animate-in slide-in-from-right duration-500"
                    >
                        <div className={`mt-0.5 ${toast.type === 'success' ? 'text-green-500' :
                                toast.type === 'error' ? 'text-red-500' :
                                    toast.type === 'warning' ? 'text-orange-500' : 'text-blue-500'
                            }`}>
                            {toast.type === 'success' && <CheckCircle2 size={18} />}
                            {toast.type === 'error' && <AlertCircle size={18} />}
                            {toast.type === 'warning' && <AlertTriangle size={18} />}
                            {toast.type === 'info' && <Info size={18} />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-[11px] font-black uppercase tracking-tight italic text-slate-800">
                                {toast.title}
                            </h4>
                            {toast.description && (
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {toast.description}
                                </p>
                            )}
                        </div>

                        <button onClick={() => removeToast(toast.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};