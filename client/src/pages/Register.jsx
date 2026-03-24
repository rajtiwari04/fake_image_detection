import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, UserPlus, User, Mail, Lock, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Security keys do not match.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Key must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Security Clearance Granted.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Provisioning failed.");
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0
                 : form.password.length < 6    ? 1
                 : form.password.length < 10   ? 2
                 :                               3;
  
  const strengthConfig = [
    { label: "Empty", color: "bg-slate-800" },
    { label: "Insecure", color: "bg-danger-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" },
    { label: "Validated", color: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]" },
    { label: "Secure", color: "bg-success-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" }
  ];

  return (
    <div className="min-h-screen bg-[#030711] flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[480px] py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-2xl shadow-brand-500/20 mb-4 group hover:rotate-6 transition-transform">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-display font-bold text-3xl text-white tracking-tight">Identity Provisioning</h2>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mt-2">New Node Registration</p>
        </div>

        <div className="relative group">
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/10 to-violet-500/10 rounded-[2.5rem] blur opacity-75" />
          
          <div className="relative bg-surface-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 sm:p-10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-600 group-focus-within/input:text-brand-400 transition-colors" />
                  </div>
                  <input name="name" type="text" required value={form.name} onChange={handleChange} placeholder="Jane Doe"
                    className="w-full h-12 pl-11 bg-surface-950/50 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-600 group-focus-within/input:text-brand-400 transition-colors" />
                  </div>
                  <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="jane@fakeshield.io"
                    className="w-full h-12 pl-11 bg-surface-950/50 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all" />
                </div>
              </div>

              {/* Password & Strength Meter */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-600 group-focus-within/input:text-brand-400 transition-colors" />
                  </div>
                  <input name="password" type={show ? "text" : "password"} required value={form.password} onChange={handleChange} placeholder="Min. 6 characters"
                    className="w-full h-12 pl-11 pr-12 bg-surface-950/50 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-600 hover:text-brand-400 transition-colors">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Tactical Strength Meter */}
                {form.password.length > 0 && (
                  <div className="px-1 pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Strength Assessment</span>
                      <span className={`text-[9px] font-bold uppercase tracking-tighter ${strength === 3 ? "text-success-400" : "text-slate-500"}`}>
                        {strengthConfig[strength].label}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${strength >= s ? strengthConfig[strength].color : "bg-white/5"}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Re-Verify Key</label>
                <div className="relative group/input">
                  <input name="confirm" type="password" required value={form.confirm} onChange={handleChange} placeholder="••••••••••••"
                    className={`w-full h-12 px-4 bg-surface-950/50 border rounded-xl text-sm text-white transition-all focus:outline-none focus:ring-1 ${
                      form.confirm && form.confirm !== form.password 
                      ? "border-danger-500/50 focus:ring-danger-500/50" 
                      : "border-white/5 focus:border-brand-500/50 focus:ring-brand-500/50"
                    }`} />
                  {form.confirm && form.confirm === form.password && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle2 className="w-4 h-4 text-success-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button type="submit" disabled={loading}
                className="group relative w-full h-12 bg-white text-black font-bold rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-lg shadow-white/5"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Provision Account</span>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-white group-hover:opacity-0 transition-opacity duration-300" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-slate-600 font-body">
                Existing operative?{" "}
                <Link to="/login" className="text-brand-400 hover:text-brand-300 font-bold transition-colors">
                  Return to Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}