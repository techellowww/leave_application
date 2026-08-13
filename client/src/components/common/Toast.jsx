import React, { createContext, useContext, useState } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === "success" && <CheckCircle size={18} color="#10b981" />}
            {toast.type === "error" && <AlertCircle size={18} color="#ef4444" />}
            {toast.type === "info" && <Info size={18} color="#3b82f6" />}
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "auto" }}
            >
              <X size={14} color="#64748b" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
