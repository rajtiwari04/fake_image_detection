import { useState, useEffect } from "react";
import { ScanSearch, RotateCcw, Send, Sparkles, ShieldAlert, Cpu, Lightbulb } from "lucide-react";
import UploadBox from "../components/UploadBox.jsx";
import ResultCard from "../components/ResultCard.jsx";
import { detectionAPI } from "../services/api.js";
import toast from "react-hot-toast";

const STAGES = {
  IDLE:      "idle",
  UPLOADING: "uploading",
  ANALYZING: "analyzing",
  DONE:      "done",
};

export default function Detect() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [stage, setStage] = useState(STAGES.IDLE);
  const [progress, setProgress] = useState(0);

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please upload an image first.");
      return;
    }

    setStage(STAGES.UPLOADING);
    setProgress(0);

    const formData = new FormData();
    formData.append("image", file);

    try {
      // Simulate upload progress briefly then switch to analysis
      setTimeout(() => setStage(STAGES.ANALYZING), 800);

      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 92) {
             clearInterval(interval);
             return 92;
          }
          return p + Math.floor(Math.random() * 5) + 1;
        });
      }, 200);

      const { data } = await detectionAPI.analyze(formData);

      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        setResult(data.detection);
        setStage(STAGES.DONE);
        if (data.mlMessage) toast(data.mlMessage, { icon: "ℹ️" });
      }, 600);
    } catch (err) {
      setStage(STAGES.IDLE);
      setProgress(0);
      const msg = err?.response?.data?.error || "Analysis failed. Check server connectivity.";
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setStage(STAGES.IDLE);
    setProgress(0);
  };

  const isLoading = stage === STAGES.UPLOADING || stage === STAGES.ANALYZING;

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Background Depth */}
      <div className="absolute top-0 -left-20 w-72 h-72 bg-brand-500/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-violet-500/5 rounded-full blur-[120px] -z-10" />

      {/* Header Section */}
      <div className="mb-10 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 justify-center sm:justify-start">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shadow-lg shadow-brand-500/5 mx-auto sm:mx-0">
            <ScanSearch className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">Image Analysis</h1>
            <p className="text-slate-500 font-body mt-1">Verify content integrity using our multi-stage CNN architecture.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upload & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-[2.5rem] bg-surface-900/40 border border-white/5 p-2 backdrop-blur-md shadow-2xl overflow-hidden">
            <UploadBox
              onFileSelect={setFile}
              selectedFile={file}
              onClear={handleReset}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAnalyze}
              disabled={!file || isLoading || stage === STAGES.DONE}
              className="relative group flex-1 h-14 bg-brand-500 hover:bg-brand-400 disabled:bg-surface-800 text-white rounded-2xl font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden shadow-lg shadow-brand-500/10 disabled:shadow-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                   <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                   <span className="animate-pulse italic">Processing Neural Path...</span>
                </div>
              ) : (
                <>
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Analyze Selection
                </>
              )}
              {/* Button Shine Effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

            {(file || result) && (
              <button
                onClick={handleReset}
                className="h-14 px-8 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Processing & Info */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Analysis Processing View */}
          {isLoading && (
            <div className="rounded-[2rem] bg-surface-900/60 border border-brand-500/20 p-8 text-center animate-in fade-in zoom-in-95">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-brand-500/20 rounded-full animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-surface-800 border border-brand-500/40 flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-brand-400 animate-pulse" />
                </div>
              </div>
              
              <h3 className="text-white font-display font-bold text-lg mb-2">
                {stage === STAGES.UPLOADING ? "Receiving Data Packet" : "Neural Analysis Active"}
              </h3>
              <p className="text-xs text-slate-500 font-body mb-6 uppercase tracking-widest">
                Progress: <span className="text-brand-400 font-mono">{progress}%</span>
              </p>
              
              <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500 shadow-[0_0_15px_rgba(14,165,233,0.4)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="text-left">
                  <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">Status</p>
                  <p className="text-xs text-brand-400 font-mono uppercase italic animate-pulse">Running</p>
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">Architecture</p>
                  <p className="text-xs text-slate-400 font-mono">CNN-X-ResNet</p>
                </div>
              </div>
            </div>
          )}

          {/* Results View */}
          {result && stage === STAGES.DONE && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
               <ResultCard detection={result} />
            </div>
          )}

          {/* Technical Briefing (Idle State) */}
          {stage === STAGES.IDLE && !file && (
            <div className="rounded-[2rem] bg-surface-900/40 border border-white/5 p-8 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                  <Lightbulb className="w-4 h-4 text-violet-400" />
                </div>
                <h3 className="font-display font-bold text-white uppercase tracking-wider text-sm">Technical Briefing</h3>
              </div>
              
              <ul className="space-y-5">
                {[
                  { title: "Resolution", text: "Lossless formats (PNG/BMP) provide the highest detection accuracy.", icon: Sparkles },
                  { title: "Context", text: "Optimized for metadata and pixel-level artifact analysis.", icon: ShieldAlert },
                  { title: "Model", text: "Trained on over 1M authentic vs. GAN-generated samples.", icon: Cpu }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 group">
                    <item.icon className="w-5 h-5 text-slate-600 group-hover:text-brand-400 transition-colors mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-tight">{item.title}</p>
                      <p className="text-sm text-slate-500 font-body leading-relaxed mt-1">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}