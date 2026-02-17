export const ProgressCard = ({ percentage }: { percentage: number }) => (
    <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Work Progress</h3>
        <div className="text-6xl font-black mb-6">{percentage}<span className="text-2xl text-blue-500 ml-1">%</span></div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
        </div>
    </div>
)