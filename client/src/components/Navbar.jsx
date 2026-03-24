import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shield, ScanSearch, Clock, LayoutDashboard, LogOut, Menu, X, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/detect",    label: "Detect",    icon: ScanSearch },
  { to: "/history",   label: "History",   icon: Clock },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location         = useLocation();
  const navigate         = useNavigate();
  const [open, setOpen]  = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add a subtle shadow/shrink effect on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    // Fixed wrapper to keep the dock floating
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pb-2 pointer-events-none">
      <nav 
        className={`mx-auto max-w-7xl pointer-events-auto transition-all duration-300 ease-out rounded-2xl border 
          ${scrolled 
            ? "bg-surface-900/60 backdrop-blur-xl border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] py-1" 
            : "bg-surface-900/40 backdrop-blur-md border-transparent shadow-none py-2"
          }`}
      >
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            
            {/* Logo area */}
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 group-hover:border-brand-400/50 group-hover:shadow-[0_0_15px_rgba(var(--brand-400),0.3)] transition-all duration-300">
                <Shield className="w-5 h-5 text-brand-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-display font-bold text-lg text-white tracking-wide">
                Fake<span className="text-brand-400">Shield</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center p-1 bg-surface-800/50 rounded-xl border border-white/5">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(to)
                      ? "text-brand-300 bg-brand-500/15 shadow-[inset_0_0_12px_rgba(255,255,255,0.02)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive(to) ? "text-brand-400" : "opacity-70"}`} />
                  {label}
                </Link>
              ))}
              
              {user?.role === "admin" && (
                <>
                  <div className="w-[1px] h-4 bg-white/10 mx-2" /> {/* Divider */}
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive("/admin")
                        ? "text-violet-300 bg-violet-500/15 shadow-[inset_0_0_12px_rgba(255,255,255,0.02)]"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <Settings className="w-4 h-4 opacity-70" />
                    Admin
                  </Link>
                </>
              )}
            </div>

            {/* User Profile & Logout (Desktop) */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-slate-200 leading-none">{user?.name || "User"}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{user?.role || "Member"}</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg border border-white/10">
                  <span className="text-sm font-bold text-white shadow-sm">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-danger-400 hover:bg-danger-500/10 border border-transparent hover:border-danger-500/20 transition-all duration-300 group"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-surface-800/50 border border-white/5 active:scale-95 transition-all"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      <div 
        className={`md:hidden absolute top-[4.5rem] left-4 right-4 transition-all duration-300 ease-in-out origin-top ${
          open ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"
        }`}
      >
        <div className="bg-surface-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl p-2 space-y-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(to)
                  ? "bg-brand-500/15 text-brand-300 border border-brand-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive(to) ? "text-brand-400" : ""}`} />
              {label}
            </Link>
          ))}
          
          {user?.role === "admin" && (
            <Link 
              to="/admin" 
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Settings className="w-5 h-5" />
              Admin
            </Link>
          )}
          
          <div className="h-[1px] bg-white/5 my-2 mx-2" />
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium text-danger-400 hover:bg-danger-500/10 hover:border-danger-500/20 border border-transparent transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}