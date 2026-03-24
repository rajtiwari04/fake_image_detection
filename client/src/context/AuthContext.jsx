import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Bootstrap: restore session ────────────────────────────────────────────
  useEffect(() => {
    const token    = localStorage.getItem("fid_token");
    const userData = localStorage.getItem("fid_user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem("fid_token");
        localStorage.removeItem("fid_user");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem("fid_token", data.token);
    localStorage.setItem("fid_user",  JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem("fid_token", data.token);
    localStorage.setItem("fid_user",  JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("fid_token");
    localStorage.removeItem("fid_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
