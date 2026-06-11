interface StepProgressProps {
  currentStep: number;
}

export default function StepProgress({ currentStep }: StepProgressProps) {
  // Map steps to clarity levels like in the screenshots:
  const levels = [0, 20, 40, 60, 80, 100];
  const percentage = levels[currentStep - 1] ?? 100;

  return (
    <div className="w-full relative z-10 glass-panel rounded-2xl px-5 py-3.5 shadow-sm">
      <div className="flex items-center justify-between font-sans text-xs font-bold text-slate-700">
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] text-slate-500">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse inline-block"></span>
          Clareza Comercial
        </span>
        <span className="text-blue-700 font-extrabold bg-blue-100/50 px-2 py-0.5 rounded-md text-3xs tracking-wider transition-all duration-300">
          {percentage}%
        </span>
      </div>
      
      {/* Background Track */}
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-300/20 p-[1.5px] border border-slate-300/10">
        {/* Dynamic Glowing Electric Blue & Lime Progress Bar */}
        <div 
          className="h-full rounded-full bg-linear-to-r from-blue-600 via-indigo-500 to-lime-400 relative transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        >
          {/* Subtle reflection overlay on progress */}
          <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
