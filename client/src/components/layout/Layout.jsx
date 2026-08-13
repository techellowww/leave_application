import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-slate)", width: "100%", overflowX: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div
        className="main-wrapper"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          marginLeft: sidebarOpen ? "260px" : "0px",
          width: sidebarOpen ? "calc(100% - 260px)" : "100%",
          transition: "margin-left 0.3s ease, width 0.3s ease",
        }}
      >
        <Header toggleSidebar={toggleSidebar} />
        
        <main
          className="app-main-content"
          style={{
            flex: 1,
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

