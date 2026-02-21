import { ReactNode } from 'react'

interface PageHeaderProps {
    title: string
    subtitle?: string
    icon?: ReactNode
    children?: ReactNode
}

export const PageHeader = ({ title, subtitle, icon, children }: PageHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-start lg:items-center justify-between gap-6 mb-10">
            {/* ฝั่งซ้าย: Title & Subtitle */}
            <div className="flex items-center gap-4">
                {icon && (
                    <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-100">
                        {icon}
                    </div>
                )}
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 italic tracking-tighter uppercase">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* ฝั่งขวา: Action Buttons */}
            <div className="flex items-center gap-3">
                {/* ส่วนของ children (เช่น ปุ่ม New Task จากหน้า Dashboard) */}
                {children}
            </div>
        </div>
    )
}