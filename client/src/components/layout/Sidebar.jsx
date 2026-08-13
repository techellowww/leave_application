import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  CalendarDays,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "user"],
    },
    {
      title: "Leave Module",
      path: "/leaves",
      icon: Calendar,
      roles: ["admin", "user"],
    },
    {
      title: "Holidays",
      path: "/calendar",
      icon: CalendarDays,
      roles: ["admin", "user"],
    },
    {
      title: "Users Management",
      path: "/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      title: "Reports",
      path: "/reports",
      icon: FileText,
      roles: ["admin"],
    },
  ];

  const allowedNav = navItems.filter((item) =>
    item.roles.includes(user?.role || "user"),
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div onClick={toggleSidebar} className="sidebar-overlay" />}

      <aside
        style={{
          width: "260px",
          backgroundColor: "var(--sidebar-bg)",
          color: "#ffffff",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.3s ease",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
        className="sidebar-container"
      >
        {/* Brand Header */}
        <div
          style={{
            padding: "1.5rem 1.25rem",
            borderBottom: "1px solid #1e293b",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
            }}
          >
            <Shield size={20} color="#ffffff" />
          </div>
          <div>
            <h2
              style={{
                fontSize: "1rem",
                color: "#ffffff",
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Leave Portal
            </h2>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              {isAdmin ? "Admin Portal" : "Employee Portal"}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav
          style={{ padding: "1.25rem 0.875rem", flex: 1, overflowY: "auto" }}
        >
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.375rem",
            }}
          >
            {allowedNav.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 768) toggleSidebar();
                    }}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      gap: "0.875rem",
                      padding: "0.75rem 0.875rem",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: isActive ? "#ffffff" : "#94a3b8",
                      backgroundColor: isActive
                        ? "var(--primary-600)"
                        : "transparent",
                      transition: "all 0.2s ease",
                      textDecoration: "none",
                    })}
                  >
                    <Icon size={18} />
                    <span>{item.title}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Footer info & Logout */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderTop: "1px solid #1e293b",
            backgroundColor: "#090d16",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ overflow: "hidden", paddingRight: "0.5rem" }}>
            <p
              style={{
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.84375rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name || "User"}
            </p>
            <p style={{ color: "#64748b", fontSize: "0.75rem", margin: 0 }}>
              ID: {user?.employeeId || "EMP"}
            </p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="btn-icon"
            style={{
              backgroundColor: "#1e293b",
              color: "#ef4444",
              border: "none",
              cursor: "pointer",
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
