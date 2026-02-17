interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children?: React.ReactNode;
  }
  
  export const PageHeader = ({ title, subtitle, icon, children }: PageHeaderProps) => (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
      <div className="space-y-2">
        {icon && <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.4em]">{icon}</div>}
        <h1 className="text-5xl font-black text-slate-800 tracking-tighter italic">{title}</h1>
        {subtitle && <p className="text-slate-400 font-medium mt-1">{subtitle}</p>}
      </div>
      <div className="w-full md:w-auto">{children}</div>
    </header>
  )