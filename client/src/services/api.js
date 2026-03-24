import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

// ─── Attach JWT on every request ──────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("fid_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Global response error handler ────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("fid_token");
      localStorage.removeItem("fid_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)     => api.post("/auth/register", data),
  login:    (data)     => api.post("/auth/login",    data),
  getMe:    ()         => api.get("/auth/me"),
};

// ─── Detection ────────────────────────────────────────────────────────────────
export const detectionAPI = {
  analyze: (formData) =>
    api.post("/detect", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 90000,
    }),

  getHistory: (params) => api.get("/detect/history", { params }),
  getById:    (id)     => api.get(`/detect/${id}`),
  deleteById: (id)     => api.delete(`/detect/${id}`),
  getAdminStats: ()    => api.get("/detect/admin/stats"),
};

export default api;
