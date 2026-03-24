import { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info, Activity, Target, Zap, Hash } from "lucide-react";

function ConfidenceBar({ value, isFake }) {
  const [width, setWidth] = useState(0);
  const pct = Math.round(value * 100);
  
  // Animate the bar on mount for a premium feel
  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(timer);
  }, [pct]);

  const colorClasses = isFake 
    ? "from-danger-600 to-danger-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]" 
    : "from-success-600 to-success-400 shadow-[0_0_20px_rgba(34,197,94,0.5)]";

  return (
    <div className="w-full relative z-10">
      <div className="flex justify-between items-end mb-2.5">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Confidence Level</span>
        <span className={`text-2xl font-display font-bold tabular-nums ${isFake ? "text-danger-400" : "text-success-400"}`}>
          {width}%
        </span>
      </div>
      <div className="h-2.5 w-full bg-surface-950/50 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-1500 ease-out bg-gradient-to-r ${colorClasses} relative`}
          style={{ width: `${width}%` }}
        >
          {/* Highlight glare on the progress bar */}
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ResultCard({ detection }) {
  if (!detection) return null;

  const { prediction, confidence, rawScore, originalName, processingTimeMs, isDemo, createdAt } = detection;
  const isFake = prediction === "FAKE";

  // Dynamic theme based on result
  const theme = isFake ? {
    border: "border-danger-500/20",
    bg: "bg-danger-950/10",
    glow: "bg-danger-500/20",
    iconBg: "bg-danger-500/10 border-danger-500/20",
    text: "text-danger-400",
    icon: <AlertTriangle className="w-7 h-7 text-danger-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />,
    title: "Manipulation Detected"
  } : {
    border: "border-success-500/20",
    bg: "bg-success-950/10",
    glow: "bg-success-500/20",
    iconBg: "bg-success-500/10 border-success-500/20",
    text: "text-success-400",
    icon: <CheckCircle2 className="w-7 h-7 text-success-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />,
    title: "Authentic Image"
  };

  return (
    <div className={`relative w-full rounded-[2rem] overflow-hidden backdrop-blur-xl border ${theme.border} bg-surface-900/40 shadow-2xl transition-all duration-500`}>
      
      {/* Ambient Background Glow */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-40 pointer-events-none transition-colors duration-700 ${theme.glow}`} />
      <div className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-[80px] opacity-30 pointer-events-none transition-colors duration-700 ${theme.glow}`} />

      <div className="relative z-10 p-6 sm:p-8 flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-lg ${theme.iconBg} backdrop-blur-md`}>
            {theme.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isFake ? "bg-danger-400" : "bg-success-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isFake ? "bg-danger-500" : "bg-success-500"}`}></span>
              </span>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-[0.2em]">
                Analysis Complete
              </p>
            </div>
            <h2 className={`font-display font-bold text-3xl sm:text-4xl tracking-tight ${theme.text}`}>
              {theme.title}
            </h2>
          </div>
        </div>

        {/* Confidence Section */}
        <div className="p-5 rounded-2xl bg-surface-800/40 border border-white/5 backdrop-blur-md">
          <ConfidenceBar value={confidence} isFake={isFake} />
          <p className="text-sm text-slate-400 font-body leading-relaxed mt-4">
            {isFake
              ? "Our neural network detected anomalies consistent with digital alteration, face-swapping, or generative AI manipulation."
              : "No significant artifacts of manipulation were found. The structural integrity and pixel distributions appear natural."}
          </p>
        </div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Prediction",  value: prediction, icon: Target },
            { label: "Confidence",  value: `${(confidence * 100).toFixed(1)}%`, icon: Activity },
            { label: "Raw Score",   value: rawScore?.toFixed(4) ?? "—", icon: Hash },
            { label: "Inference",   value: processingTimeMs ? `${processingTimeMs}ms` : "—", icon: Zap },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="group flex flex-col gap-2 rounded-2xl px-5 py-4 bg-surface-900/40 border border-white/5 hover:bg-surface-800/60 hover:border-white/10 transition-all duration-300">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{label}</p>
              </div>
              <p className="text-lg font-mono font-semibold text-slate-200 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Metadata & Warnings */}
        <div className="flex flex-col gap-3">
          {originalName && (
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-surface-900/30 border border-white/5 hover:bg-surface-900/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4 text-brand-400" />
              </div>
              <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <p className="text-sm text-slate-300 font-mono truncate">{originalName}</p>
                {createdAt && (
                  <p className="text-xs text-slate-500 font-mono whitespace-nowrap">
                    {new Date(createdAt).toLocaleString(undefined, { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {isDemo && (
            <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
              <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200/90 font-body leading-relaxed">
                <strong className="text-yellow-400 font-semibold">Demo Mode Active:</strong> This is a simulated response. The underlying ML inference engine is currently bypassed.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}