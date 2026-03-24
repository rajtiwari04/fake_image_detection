import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, LogIn, Lock, Mail, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Identity Verified. Welcome.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Access Denied. Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030711] flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-700">
        
        {/* Branding/Logo Above Card */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-2xl shadow-brand-500/20 mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-display font-bold text-3xl text-white tracking-tight">
            Fake<span className="text-brand-400">Shield</span>
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Secure Terminal v2.0</span>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="relative group">
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500/20 to-violet-500/20 rounded-[2.5rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          
          <div className="relative bg-surface-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 sm:p-10 shadow-2xl">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-white tracking-tight">System Authentication</h1>
              <p className="text-sm text-slate-500 mt-1">Please provide your credentials to access the node.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Archive ID (Email)</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-600 group-focus-within/input:text-brand-400 transition-colors" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="agent@fakeshield.io"
                    className="w-full h-12 pl-11 bg-surface-950/50 border border-white/5 rounded-xl text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access Key</label>
                  <button type="button" className="text-[10px] font-bold text-brand-500 hover:text-brand-400 uppercase tracking-tighter transition-colors">Forgot Key?</button>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-600 group-focus-within/input:text-brand-400 transition-colors" />
                  </div>
                  <input
                    name="password"
                    type={show ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full h-12 pl-11 pr-12 bg-surface-950/50 border border-white/5 rounded-xl text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-600 hover:text-brand-400 transition-colors"
                  >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-12 bg-white text-black font-bold rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-white/5"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Initialize Login</span>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-white group-hover:opacity-0 transition-opacity duration-300" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-slate-600 font-body">
                New to the platform?{" "}
                <Link to="/register" className="text-brand-400 hover:text-brand-300 font-bold transition-colors">
                  Create Security Clearance
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Tactical Note */}
        <div className="mt-8 flex items-center justify-center gap-4 text-[9px] font-mono text-slate-700 uppercase tracking-[0.2em]">
          <span className="flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> AES-256</span>
          <span className="w-1 h-1 rounded-full bg-slate-800" />
          <span>SSL Encryption</span>
          <span className="w-1 h-1 rounded-full bg-slate-800" />
          <span>End-to-End</span>
        </div>
      </div>
    </div>
  );
}