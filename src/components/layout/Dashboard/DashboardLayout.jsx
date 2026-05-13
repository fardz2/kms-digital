import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(
    !window.matchMedia("(max-width: 768px)").matches
  );

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-faint-fog flex">
      <Sidebar
        showSidebar={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 p-[13px] rounded-default bg-white border border-light-ash text-deep-slate hover:bg-faint-fog transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          aria-label="Buka sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      )}

      <main
        className={`flex-1 min-w-0 transition-all duration-250 ease-out-quart ${
          sidebarOpen ? "md:ml-60" : ""
        }`}
      >
        <div className="p-4 md:p-[25px] max-w-page mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
