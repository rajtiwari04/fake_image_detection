import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ImageIcon, X, ZoomIn, FileImage, ShieldCheck } from "lucide-react";

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPT   = { "image/jpeg": [], "image/png": [], "image/webp": [], "image/bmp": [] };

export default function UploadBox({ onFileSelect, selectedFile, onClear }) {
  const [preview, setPreview]   = useState(null);
  const [lightbox, setLightbox] = useState(false);

  const onDrop = useCallback(
    (accepted, rejected) => {
      if (rejected.length > 0) {
        // You could replace these alerts with a modern Toast notification later
        const err = rejected[0].errors[0];
        if (err.code === "file-too-large")    alert("File exceeds 10 MB limit.");
        if (err.code === "file-invalid-type") alert("Only JPEG, PNG, WebP, BMP are supported.");
        return;
      }
      const file = accepted[0];
      if (!file) return;

      const url = URL.createObjectURL(file);
      setPreview(url);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept:    ACCEPT,
    maxSize:   MAX_SIZE,
    maxFiles:  1,
    multiple:  false,
  });

  const handleClear = (e) => {
    e.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onClear();
  };

  return (
    <>
      <div
        {...getRootProps()}
        className={`relative group rounded-[2.5rem] border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-md
          ${isDragReject ? "border-danger-500/50 bg-danger-500/5" : 
            isDragActive ? "border-brand-400 bg-brand-500/10 scale-[0.99] shadow-inner" : 
            selectedFile ? "border-brand-500/20 bg-surface-900/40 shadow-2xl" : 
            "border-white/10 bg-surface-900/40 hover:border-brand-500/40"}
          ${!selectedFile ? "min-h-[340px] flex items-center justify-center" : ""}`}
      >
        <input {...getInputProps()} />

        {/* Ambient background decoration for empty state */}
        {!selectedFile && (
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
            <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/5 to-transparent transition-opacity duration-500 ${isDragActive ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        )}

        {selectedFile && preview ? (
          /* ── Modern Image Preview ────────────────────────────────── */
          <div className="relative w-full animate-in fade-in zoom-in-95 duration-500">
            <div className="p-4">
              <div className="relative rounded-[1.5rem] overflow-hidden group/img ring-1 ring-white/10 shadow-2xl">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-[450px] object-cover transition-transform duration-700 group-hover/img:scale-105"
                />
                
                {/* Visual Scanner Effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_15px_rgba(var(--brand-400),0.8)] animate-scan" />
                </div>

                {/* Hover Overlay Controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all transform hover:scale-110"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleClear}
                    className="p-3 rounded-full bg-danger-500/20 backdrop-blur-md border border-danger-500/30 text-danger-400 hover:bg-danger-500/40 transition-all transform hover:scale-110"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Glass Metadata Bar */}
            <div className="mt-2 px-6 pb-6 pt-2">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-800/60 border border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                    <FileImage className="w-5 h-5 text-brand-400" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-medium text-slate-100 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Ready for Analysis</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <p className="text-[10px] text-brand-400/70 font-bold uppercase mt-1">Image/{(selectedFile.type.split('/')[1])}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Premium Drop Zone ────────────────────────────────────── */
          <div className="flex flex-col items-center gap-6 p-10 text-center relative z-10">
            <div className="relative">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 rotate-3 group-hover:rotate-0
                ${isDragActive ? "bg-brand-500 shadow-[0_0_30px_rgba(var(--brand-500),0.4)]" : "bg-surface-800 border border-white/5 shadow-xl"}`}>
                <Upload className={`w-9 h-9 transition-colors duration-500 ${isDragActive ? "text-white" : "text-slate-500 group-hover:text-brand-400"}`} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
              </div>
            </div>

            <div className="max-w-[280px]">
              <h3 className="text-xl font-display font-bold text-white tracking-tight">
                {isDragActive ? "Release to Analyze" : "Upload Content"}
              </h3>
              <p className="text-slate-400 text-sm font-body mt-2 leading-relaxed">
                Drag an image here or <span className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">browse files</span> to start the scan
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 pt-2">
              {["JPEG", "PNG", "WEBP", "BMP"].map((fmt) => (
                <span key={fmt} className="px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter bg-surface-800/80 border border-white/5 text-slate-500">
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modern Lightbox Overlay */}
      {lightbox && preview && (
        <div 
          className="fixed inset-0 z-[100] bg-surface-950/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setLightbox(false)}
        >
          <div className="absolute top-6 right-6 flex gap-3">
             <button
              className="p-3 rounded-full bg-white/5 text-slate-400 hover:text-white border border-white/10 transition-all hover:bg-white/10"
              onClick={() => setLightbox(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <img
            src={preview}
            alt="Full preview"
            className="max-w-full max-h-[90vh] rounded-3xl object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}