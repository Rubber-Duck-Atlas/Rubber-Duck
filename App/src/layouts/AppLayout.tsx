import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

// Combines sidebar and current page
export default function AppLayout() {
  return (
    // creates a full height container and lines up the children horizontally
    <div className="flex min-h-screen">
        {/* Renders previously built sidebar */}
      <Sidebar />

        {/* Creates space to the right of sidebar */}
      <div className="min-w-0 flex-1 bg-ink pl-12 text-peri">
        {/* Displays current page */}
        <Outlet />
      </div>
    </div>
  );
}
