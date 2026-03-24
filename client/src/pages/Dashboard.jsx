import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";

/* ─── Fake data ─────────────────────────────────────────────── */
const FAKE_DETECTIONS = [
  { _id: "1", originalName: "profile_photo_edit.jpg", prediction: "FAKE", createdAt: "2025-03-20T10:23:00Z", confidence: 94 },
  { _id: "2", originalName: "event_banner_2025.png", prediction: "REAL", createdAt: "2025-03-19T15:42:00Z", confidence: 88 },
  { _id: "3", originalName: "news_thumbnail.webp", prediction: "FAKE", createdAt: "2025-03-18T08:11:00Z", confidence: 97 },
  { _id: "4", originalName: "product_mockup_v3.png", prediction: "REAL", createdAt: "2025-03-17T21:05:00Z", confidence: 73 },
  { _id: "5", originalName: "social_post_image.jpg", prediction: "FAKE", createdAt: "2025-03-16T13:30:00Z", confidence: 91 },
];
const USER_NAME = "Arjun";

/* ─── Utility ───────────────────────────────────────────────── */
function fmt(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/* ─── Animated Counter ──────────────────────────────────────── */
function Counter({ to, duration = 1.4 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      setVal(Math.floor(p * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to, duration]);
  return <>{val}</>;
}

/* ─── Glowing Orb ───────────────────────────────────────────── */
function Orb({ x, y, color, size = 320 }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y,
        width: size, height: size,
        background: color,
        filter: "blur(90px)",
        opacity: 0.18,
        transform: "translate(-50%,-50%)",
      }}
    />
  );
}

/* ─── Noise texture overlay ─────────────────────────────────── */
function NoiseOverlay() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" style={{ zIndex: 1 }}>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}

/* ─── Pulse ring ────────────────────────────────────────────── */
function PulseRing({ color }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ border: `1px solid ${color}` }}
      animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

/* ─── Tilt card ─────────────────────────────────────────────── */
function TiltCard({ children, className = "" }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    ry.set(((e.clientX - cx) / rect.width) * 12);
    rx.set(-((e.clientY - cy) / rect.height) * 12);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stat Card ─────────────────────────────────────────────── */
function StatCard({ label, value, icon, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <TiltCard className="relative rounded-2xl overflow-hidden cursor-default select-none" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
            >
              {icon}
            </div>
            <div className="relative w-2 h-2 mt-1">
              <div className="absolute inset-0 rounded-full" style={{ background: accent }} />
              <PulseRing color={accent} />
            </div>
          </div>
          <p className="text-5xl font-black tracking-tight" style={{ color: "#f0f0f0", fontFamily: "'Syne', sans-serif" }}>
            <Counter to={value} />
          </p>
          <p className="text-xs uppercase tracking-[0.2em] mt-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>
            {label}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${accent}80, transparent)` }} />
      </TiltCard>
    </motion.div>
  );
}

/* ─── Activity Row ───────────────────────────────────────────── */
function ActivityRow({ d, i }) {
  const isFake = d.prediction === "FAKE";
  const accent = isFake ? "#ef4444" : "#22c55e";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
      className="flex items-center gap-4 px-6 py-4 transition-colors rounded-xl mx-2 cursor-default"
    >
      {/* icon */}
      <div className="relative shrink-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
          style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
          {isFake ? "⚠" : "✓"}
        </div>
      </div>

      {/* name */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif" }}>
          {d.originalName}
        </p>
        <p className="text-[10px] mt-0.5 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
          {fmt(d.createdAt)}
        </p>
      </div>

      {/* confidence bar */}
      <div className="hidden sm:flex flex-col items-end gap-1.5 w-28">
        <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
          conf. {d.confidence}%
        </p>
        <div className="w-full h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${d.confidence}%` }}
            transition={{ delay: 0.6 + i * 0.07, duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${accent}80, ${accent})` }}
          />
        </div>
      </div>

      {/* badge */}
      <div className="shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
        style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}>
        {d.prediction}
      </div>
    </motion.div>
  );
}

/* ─── Scan Button ────────────────────────────────────────────── */
function ScanButton() {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileTap={{ scale: 0.97 }}
      className="relative overflow-hidden rounded-2xl px-8 py-4 font-black text-sm uppercase tracking-widest"
      style={{
        fontFamily: "'Syne', sans-serif",
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        boxShadow: hover ? "0 0 40px rgba(99,102,241,0.5)" : "0 0 20px rgba(99,102,241,0.2)",
        transition: "box-shadow 0.3s",
        color: "#fff",
        border: "none",
        cursor: "pointer",
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa)" }}
        animate={{ opacity: hover ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      <span className="relative flex items-center gap-2">
        <motion.span animate={{ rotate: hover ? 360 : 0 }} transition={{ duration: 0.5 }}>
          ⬡
        </motion.span>
        New Analysis
      </span>
    </motion.button>
  );
}

/* ─── Mini donut ─────────────────────────────────────────────── */
function Donut({ fakes, reals }) {
  const total = fakes + reals;
  if (total === 0) return null;
  const fakePct = (fakes / total) * 100;
  const r = 36, cx = 44, cy = 44, circ = 2 * Math.PI * r;
  const fakeDash = (fakePct / 100) * circ;

  return (
    <motion.svg
      width="88" height="88" viewBox="0 0 88 88"
      initial={{ rotate: -90 }}
      style={{ display: "block" }}
    >
      <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth="8" stroke="rgba(255,255,255,0.06)" />
      <motion.circle
        cx={cx} cy={cy} r={r} fill="none" strokeWidth="8"
        stroke="#22c55e"
        strokeDasharray={circ}
        strokeDashoffset={circ - (circ - fakeDash)}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (circ - fakeDash) }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
      />
      <motion.circle
        cx={cx} cy={cy} r={r} fill="none" strokeWidth="8"
        stroke="#ef4444"
        strokeDasharray={circ}
        strokeDashoffset={circ - fakeDash}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - fakeDash }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
      />
    </motion.svg>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────── */
export default function Dashboard() {
  const detections = FAKE_DETECTIONS;
  const total = detections.length;
  const fakes = detections.filter(d => d.prediction === "FAKE").length;
  const reals = detections.filter(d => d.prediction === "REAL").length;
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <div className="min-h-screen relative overflow-hidden"
        style={{ background: "#080810", fontFamily: "'DM Sans', sans-serif" }}>

        <NoiseOverlay />

        {/* Ambient orbs */}
        <Orb x="10%" y="20%" color="#6366f1" size={500} />
        <Orb x="85%" y="10%" color="#8b5cf6" size={380} />
        <Orb x="60%" y="80%" color="#06b6d4" size={340} />

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          zIndex: 0,
        }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── Top bar ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-12"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                ◈
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.25em]"
                style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace" }}>
                VerifyAI
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }}>
                {USER_NAME[0]}
              </div>
            </div>
          </motion.div>

          {/* ── Hero header ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12"
          >
            <p className="text-xs uppercase tracking-[0.3em] mb-3"
              style={{ color: "rgba(99,102,241,0.7)", fontFamily: "'DM Mono', monospace" }}>
              // system online
            </p>
            <h1 className="text-5xl sm:text-6xl font-black leading-none mb-3"
              style={{ fontFamily: "'Syne', sans-serif", color: "#f0f0f8" }}>
              Hello,{" "}
              <span style={{
                background: "linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {USER_NAME}
              </span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 15 }}>
              You've analyzed <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{total} images</span> — neural integrity confirmed.
            </p>
          </motion.div>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-12 gap-5">

            {/* CTA panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="col-span-12 lg:col-span-7 rounded-3xl overflow-hidden relative"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              <div className="absolute inset-0" style={{
                background: "radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.1) 0%, transparent 60%)",
              }} />

              {/* Decorative hex grid */}
              <div className="absolute right-0 top-0 bottom-0 w-48 opacity-5 pointer-events-none"
                style={{
                  backgroundImage: "repeating-linear-gradient(60deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 30px)",
                  backgroundSize: "30px 52px",
                }} />

              <div className="relative p-8 sm:p-10 flex flex-col h-full gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)" }}>
                      ◎
                    </div>
                    <div className="w-px h-6" style={{ background: "rgba(255,255,255,0.08)" }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em]"
                      style={{ color: "rgba(99,102,241,0.7)", fontFamily: "'DM Mono', monospace" }}>
                      Neural Detection Engine
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black mb-3" style={{ fontFamily: "'Syne', sans-serif", color: "#f0f0f8" }}>
                    Begin New<br />
                    <span style={{ color: "#818cf8" }}>Analysis</span>
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, lineHeight: 1.7 }}>
                    Deploy multi-layer forensic detection to verify image authenticity with sub-pixel precision.
                  </p>
                </div>
                <div>
                  <ScanButton />
                </div>

                {/* bottom stats strip */}
                <div className="flex gap-6 pt-4 mt-auto" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {[["99.2%", "Accuracy"], ["< 2s", "Latency"], ["v4.1", "Model"]].map(([val, lbl]) => (
                    <div key={lbl}>
                      <p className="text-lg font-black" style={{ fontFamily: "'Syne', sans-serif", color: "#f0f0f8" }}>{val}</p>
                      <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>{lbl}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Stats + donut */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Total" value={total} icon="⬡" accent="#818cf8" delay={0.25} />
                <StatCard label="Fake" value={fakes} icon="⚠" accent="#ef4444" delay={0.32} />
                <StatCard label="Real" value={reals} icon="✓" accent="#22c55e" delay={0.39} />
              </div>

              {/* Ratio panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-6 flex-1 flex items-center gap-6"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <Donut fakes={fakes} reals={reals} />
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'DM Mono', monospace" }}>
                    Distribution
                  </p>
                  <div className="space-y-2.5">
                    {[["Fake", fakes, "#ef4444"], ["Real", reals, "#22c55e"]].map(([lbl, count, col]) => (
                      <div key={lbl} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: col }} />
                          <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{lbl}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: total > 0 ? `${(count / total) * 100}%` : 0 }}
                              transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ background: col }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold" style={{ color: col }}>
                            {total > 0 ? Math.round((count / total) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="col-span-12 rounded-3xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* header */}
              <div className="flex items-center justify-between px-6 py-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span className="text-sm font-bold uppercase tracking-[0.2em]"
                    style={{ fontFamily: "'Syne', sans-serif", color: "rgba(255,255,255,0.7)" }}>
                    Recent Activity
                  </span>
                </div>
                <button
                  className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    color: "rgba(99,102,241,0.7)",
                    background: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    cursor: "pointer",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  View All →
                </button>
              </div>

              {/* rows */}
              <div className="py-2">
                {detections.map((d, i) => <ActivityRow key={d._id} d={d} i={i} />)}
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-10 flex items-center justify-between"
          >
            <p className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>
              © 2025 VerifyAI · AP-SOUTH-1 · Secure
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-70" />
              <p className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                All systems operational
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}