import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { Shield } from "lucide-react";
import Navbar     from "./components/Navbar.jsx";
import Login      from "./pages/Login.jsx";
import Register   from "./pages/Register.jsx";
import Detect     from "./pages/Detect.jsx";
import Dashboard  from "./pages/Dashboard.jsx";
import History    from "./pages/History.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Landing    from "./pages/Landing.jsx";

/**
 * Global Loader - The "System Boot" Sequence
 */
const SystemLoader = () => (
  <div className="flex flex-col h-screen w-full items-center justify-center bg-[#030711] relative overflow-hidden">
    <div className="absolute inset-0 bg-brand-500/5 blur-[100px] rounded-full scale-150 animate-pulse" />
    <div className="relative z-10 flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6 animate-bounce-slow">
        <Shield className="w-8 h-8 text-brand-400" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] font-mono font-bold text-brand-500 uppercase tracking-[0.5em] animate-pulse">
          Establishing Secure Link
        </span>
        <div className="w-48 h-1 bg-surface-900 rounded-full overflow-hidden p-[1px]">
          <div className="h-full bg-brand-500 rounded-full animate-progress" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Route Protectors
 */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <SystemLoader />;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <SystemLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <SystemLoader />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#030711] selection:bg-brand-500/30">
      {/* Navbar only appears if a user is authenticated 
          AND they are not on the Landing page (optional choice)
      */}
      {user && <Navbar />}

      <main className={`relative ${user ? 'pt-0' : 'pt-0'}`}>
        <Routes location={location} key={location.pathname}>
          {/* Public Access */}
          <Route path="/"         element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Secure Operative Access */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/detect"    element={<PrivateRoute><Detect /></PrivateRoute>} />
          <Route path="/history"   element={<PrivateRoute><History /></PrivateRoute>} />
          
          {/* Admin Command Center */}
          <Route path="/admin"     element={<AdminRoute><AdminPanel /></AdminRoute>} />

          {/* Global Redirector */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
        </Routes>
      </main>

      {/* Global Ambient Glow Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]" />
      </div>
    </div>
  );
}