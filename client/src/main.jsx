import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e293b",
              color:      "#e2e8f0",
              border:     "1px solid rgba(14,165,233,0.2)",
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: "12px",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#0f172a" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#0f172a" } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
