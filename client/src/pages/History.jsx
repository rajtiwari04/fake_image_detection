import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  Clock, Trash2, AlertTriangle, CheckCircle2, Search, 
  Filter, ScanSearch, ExternalLink, Calendar, ChevronLeft, ChevronRight 
} from "lucide-react";
import { detectionAPI } from "../services/api.js";
import toast from "react-hot-toast";

const BASE_URL = "http://localhost:5000";

// Skeleton Loader for History Cards
const CardSkeleton = () => (
  <div className="rounded-[2rem] bg-surface-900/40 border border-white/5 h-64 animate-pulse p-1">
    <div className="h-32 w-full bg-surface-800 rounded-t-[1.9rem]" />
    <div className="p-4 space-y-3">
      <div className="h-4 w-3/4 bg-surface-800 rounded" />
      <div className="h-3 w-1/2 bg-surface-800 rounded" />
    </div>
  </div>
);

export default function History() {
  const [detections, setDetections] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filter,     setFilter]     = useState("ALL");
  const [loading,    setLoading]    = useState(true);
  const [deleting,   setDeleting]   = useState(null);

  const fetchHistory = useCallback(async (page = 1, prediction = "ALL") => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (prediction !== "ALL") params.prediction = prediction;

      const { data } = await detectionAPI.getHistory(params);
      setDetections(data.detections || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      toast.error("Cloud synchronization failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1, filter);
  }, [filter, fetchHistory]);

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm permanent removal from archives?")) return;
    setDeleting(id);
    try {
      await detectionAPI.deleteById(id);
      toast.success("Entry purged.");
      fetchHistory(pagination.page, filter);
    } catch {
      toast.error("Purge failed.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Background Ambient Depth */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-[120px] -z-10" />

      {/* Header & Filter Control */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shadow-lg shadow-brand-500/5">
              <Clock className="w-5 h-5 text-brand-400" />
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">Detection Archive</h1>
          </div>
          <p className="text-slate-500 font-body text-sm pl-1 shadow-sm italic">
            Retrieving {pagination.total} analysis records from neural storage
          </p>
        </div>

        {/* Tactical Segmented Filter */}
        <div className="flex p-1 bg-surface-900/80 border border-white/5 rounded-2xl backdrop-blur-md">
          {["ALL", "REAL", "FAKE"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-xl text-[10px] font-bold tracking-[0.2em] transition-all duration-300 ${
                filter === f
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : detections.length === 0 ? (
        <div className="rounded-[3rem] border border-white/5 bg-surface-900/40 py-24 flex flex-col items-center justify-center text-center px-6 backdrop-blur-xl">
          <div className="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center mb-6 border border-white/5">
            <ScanSearch className="w-8 h-8 text-slate-600" />
          </div>
          <p className="font-display font-bold text-slate-300 text-xl mb-2 tracking-tight">Archive Empty</p>
          <p className="text-slate-500 font-body text-sm max-w-xs leading-relaxed">
            {filter !== "ALL" ? `No ${filter} signatures currently indexed.` : "No neural analysis logs found on this node."}
          </p>
          <Link to="/detect" className="mt-8 px-8 py-3 rounded-full bg-brand-500 text-white font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-brand-500/20">
            Launch New Scan
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {detections.map((d) => (
              <div key={d._id}
                className={`group relative rounded-[2rem] bg-surface-900/40 border transition-all duration-500 overflow-hidden backdrop-blur-md hover:shadow-2xl hover:-translate-y-1 ${
                  d.prediction === "FAKE" ? "border-danger-500/10 hover:border-danger-500/30" : "border-success-500/10 hover:border-success-500/30"
                }`}
              >
                {/* Visual Header */}
                <div className="relative h-44 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-900 to-transparent z-10 opacity-60" />
                  <img
                    src={`${BASE_URL}/${d.imagePath}`}
                    alt={d.originalName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-surface-800 text-slate-600 text-[10px] uppercase font-bold tracking-widest">Image Purged</div>`;
                    }}
                  />
                  
                  {/* Status Badge Overlays */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-bold tracking-widest backdrop-blur-md border ${
                      d.prediction === "FAKE" 
                        ? "bg-danger-500/20 text-danger-400 border-danger-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                        : "bg-success-500/20 text-success-400 border-success-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                    }`}>
                      {d.prediction}
                    </span>
                  </div>

                  {/* Quick Action Overlay (Hover) */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleDelete(d._id)}
                      disabled={deleting === d._id}
                      className="p-3 rounded-full bg-danger-500/20 backdrop-blur-md border border-danger-500/30 text-danger-400 hover:bg-danger-500/40 transition-all"
                    >
                      {deleting === d._id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Metadata Body */}
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-slate-200 truncate group-hover:text-brand-400 transition-colors mb-4" title={d.originalName}>
                    {d.originalName}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] font-mono">{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`text-sm font-display font-black italic ${
                      d.prediction === "FAKE" ? "text-danger-400" : "text-success-400"
                    }`}>
                      {(d.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Mini Tactical Progress Bar */}
                  <div className="h-1 w-full bg-surface-800 rounded-full overflow-hidden p-[1px]">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        d.prediction === "FAKE" ? "bg-danger-500" : "bg-success-500"
                      }`}
                      style={{ width: `${(d.confidence * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tactical Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 pb-10">
              <button 
                onClick={() => fetchHistory(pagination.page - 1, filter)}
                disabled={pagination.page === 1}
                className="w-10 h-10 rounded-xl bg-surface-900 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-surface-900/50 border border-white/5 rounded-xl">
                <span className="text-xs font-mono text-brand-400 font-bold">{pagination.page}</span>
                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter">of {pagination.pages}</span>
              </div>

              <button 
                onClick={() => fetchHistory(pagination.page + 1, filter)}
                disabled={pagination.page === pagination.pages}
                className="w-10 h-10 rounded-xl bg-surface-900 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}