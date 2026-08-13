import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "../components/common/Toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await login(email, password);
      showToast("Logged in successfully!", "success");
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header Branding */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              boxShadow: "0 10px 20px rgba(99, 102, 241, 0.35)",
            }}
          >
            <Shield size={28} color="#ffffff" />
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              color: "#0f172a",
              fontWeight: 800,
              margin: "0 0 0.5rem",
            }}
          >
            Leave Portal Login
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
            Enter your credentials to access your leave account
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              fontSize: "0.875rem",
              marginBottom: "1.25rem",
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Office Email <span className="required-star">*</span>
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                color="#94a3b8"
                style={{
                  position: "absolute",
                  left: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: "2.5rem" }}
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">
              Password <span className="required-star">*</span>
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                color="#94a3b8"
                style={{
                  position: "absolute",
                  left: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "0.75rem", fontSize: "0.95rem" }}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
