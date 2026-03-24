import { useState, useEffect } from "react";
import { 
  BarChart2, AlertTriangle, CheckCircle2, Database, Users, 
  TrendingUp, Clock, ArrowUpRight, Search, Filter 
} from "lucide-react";
import { detectionAPI } from "../services/api.js";
import toast from "react-hot-toast";

const BASE_URL = "http://localhost:5000";

// Upgraded Stat Card with Ambient Glow
function BigStat({ icon: Icon, label, value, sub, colorClass, glowColor }) {
  return (
    <div className={`relative group overflow-hidden rounded-[2rem] p-6 border border-white/5 bg-surface-900/40 backdrop-blur-md transition-all duration-500 hover:border-white/10 hover:bg-surface-800/50`}>
      {/* Background Ambient Glow */}
      <div className={`absolute -right-8 -top-8 w-24 h-24 blur-[50px] opacity-20 transition-opacity group-hover:opacity-40 ${glowColor}`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl bg-surface-800 border border-white/5 ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</span>
        </div>
        
        <div className="flex items-baseline gap-2">
          <p className="font-display font-bold text-4xl text-white tracking-tight">{value}</p>
          <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </div>
        
        {sub && (
          <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectionAPI.getAdminStats()
      .then(({ data }) => setStats(data))
      .catch(() => toast.error("Failed to load admin stats."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
        <div className="h-10 w-48 bg-surface-800 rounded-lg mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-surface-800 rounded-[2rem]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-surface-800 rounded-[2rem]" />
          <div className="h-64 bg-surface-800 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  const s = stats?.stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-lg shadow-violet-500/5">
              <BarChart2 className="w-5 h-5 text-violet-400" />
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">Admin Dashboard</h1>
          </div>
          <p className="text-slate-500 font-body text-sm pl-1 shadow-sm">Real-time system oversight and ML model metrics</p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 p-1 bg-surface-900/50 border border-white/5 rounded-2xl backdrop-blur-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search records..." 
              className="bg-transparent border-none text-sm text-slate-300 focus:ring-0 pl-9 pr-4 py-2 w-48"
            />
          </div>
          <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Grid - The "Bento" Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <BigStat
          icon={Database}
          label="Total Scans"
          value={s.total ?? "0"}
          sub="Indexed across all nodes"
          colorClass="text-brand-400"
          glowColor="bg-brand-500"
        />
        <BigStat
          icon={AlertTriangle}
          label="Anomalies"
          value={s.fakeCount ?? "0"}
          sub={`${s.fakePercent ?? 0}% detected as FAKE`}
          colorClass="text-danger-400"
          glowColor="bg-danger-500"
        />
        <BigStat
          icon={CheckCircle2}
          label="Verified"
          value={s.realCount ?? "0"}
          sub="Verified authentic assets"
          colorClass="text-success-400"
          glowColor="bg-success-500"
        />
        <BigStat
          icon={TrendingUp}
          label="Precision"
          value={s.avgConfidence ? `${s.avgConfidence}%` : "0%"}
          sub="Mean model confidence"
          colorClass="text-violet-400"
          glowColor="bg-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 rounded-[2.5rem] bg-surface-900/40 border border-white/5 overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-brand-400" />
              </div>
              <h2 className="font-display font-bold text-lg text-white">Live Activity Stream</h2>
            </div>
            <button className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors uppercase tracking-widest">View All</button>
          </div>
          
          <div className="divide-y divide-white/[0.03]">
            {(stats?.recentUploads || []).length === 0 ? (
              <div className="px-8 py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <Database className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-slate-500 font-body text-sm">Waiting for incoming data stream...</p>
              </div>
            ) : (
              (stats?.recentUploads || []).map((d) => (
                <div key={d._id} className="group flex items-center gap-5 px-8 py-5 hover:bg-white/[0.02] transition-all">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-800 border border-white/10 ring-2 ring-transparent group-hover:ring-brand-500/20 transition-all">
                    <img
                      src={`${BASE_URL}/${d.imagePath}`}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-semibold truncate group-hover:text-brand-300 transition-colors">{d.originalName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tight">{d.user?.name || "System"}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-[10px] text-slate-600 font-mono">
                        {new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                      d.prediction === "FAKE" 
                        ? "bg-danger-500/10 text-danger-400 border border-danger-500/20" 
                        : "bg-success-500/10 text-success-400 border border-success-500/20"
                    }`}>
                      {d.prediction}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 italic">
                      {(d.confidence * 100).toFixed(0)}% Match
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Contributors Card */}
        <div className="flex flex-col gap-6">
          <div className="rounded-[2.5rem] bg-surface-900/40 border border-white/5 overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="px-8 py-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-violet-400" />
                </div>
                <h2 className="font-display font-bold text-lg text-white">Top Users</h2>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {(stats?.topUsers || []).length === 0 ? (
                <p className="text-slate-500 font-body text-sm px-4 py-8 text-center italic">No active users.</p>
              ) : (
                (stats?.topUsers || []).map((u, i) => (
                  <div key={u._id} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-colors group">
                    <span className="text-xs font-mono text-slate-600 w-4 font-bold italic">{i + 1}</span>
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-surface-800 to-surface-700 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-brand-500/50 transition-colors">
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white">
                          {u.userInfo?.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-500 border-2 border-surface-900 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{u.userInfo?.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{u.userInfo?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-400 tracking-tighter">{u.count}</p>
                      <p className="text-[10px] text-slate-600 font-medium uppercase">Scans</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Model Health Breakdown */}
          {s.total > 0 && (
            <div className="rounded-[2rem] p-8 bg-surface-950/40 border border-brand-500/10 shadow-inner">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Model Distribution</h3>
              <div className="space-y-6">
                {[
                  { label: "Anomalies", pct: s.fakePercent, color: "bg-danger-500", glow: "shadow-[0_0_15px_rgba(239,68,68,0.4)]" },
                  { label: "Authentic", pct: s.realPercent, color: "bg-success-500", glow: "shadow-[0_0_15px_rgba(34,197,94,0.4)]" },
                ].map(({ label, pct, color, glow }) => (
                  <div key={label} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{label}</span>
                      <span className="text-lg font-display font-bold text-white italic">{pct}%</span>
                    </div>
                    <div className="h-2 bg-surface-800 rounded-full overflow-hidden p-[1px]">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${color} ${glow} relative`}
                        style={{ width: `${pct}%` }}
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}