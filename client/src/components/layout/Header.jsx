import React from "react";
import { Menu, User as UserIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          onClick={toggleSidebar}
          className="btn-icon btn-secondary"
          style={{ display: "flex", border: "1px solid var(--border-color)" }}
          aria-label="Toggle Sidebar"
        >
          <Menu size={18} />
        </button>
        <div>
          <h3 className="header-welcome-title" style={{ fontSize: "1.125rem", margin: 0, fontWeight: 700 }}>
            Welcome, {user?.name?.split(" ")[0] || "User"} 👋
          </h3>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "0.375rem 0.75rem",
            backgroundColor: "var(--bg-slate)",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-600)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.875rem",
              flexShrink: 0,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, lineHeight: 1.2 }}>
              {user?.name}
            </span>
            <span className="header-user-meta" style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
              {user?.role} • {user?.employeeId}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

