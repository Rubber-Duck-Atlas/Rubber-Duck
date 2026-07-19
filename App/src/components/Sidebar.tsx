import React from "react";
import { NavLink } from "react-router-dom";
import { Folder, House, Settings } from "lucide-react";

// Shared sidebar navigation for main application pages
export default function Sidebar() {
  return (
    <aside className="min-h-screen w-64 bg-black p-5 text-white">
      {/* header / branding */}
      <div>
        <h1 className="text-xl text-lilac text-center ">Rubber Duck Nav</h1>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {/* Navigates to home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? // shows ui for the page currently open
                "flex items-center gap-3 rounded-lg bg-lilac px-4 py-3 text-white"
              : // shows ui for an inactive navigation link
                "flex items-center gap-3 rounded-lg px-4 py-3 text-peri hover:bg-slate-800"
          }
        >
          <House />
          <span>Home</span>
        </NavLink>

        {/* Navigates to document library */}
        <NavLink
          to="/Documents"
          className={({ isActive }) =>
            isActive
              ? // shows ui for the page currently open
                "flex items-center gap-3 rounded-lg bg-lilac px-4 py-3 text-white"
              : // shows ui for an inactive navigation link
                "flex items-center gap-3 rounded-lg px-4 py-3 text-peri hover:bg-slate-800"
          }
        >
          <Folder />
          <span>Documents</span>
        </NavLink>

        {/* Navigates to settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive
              ? // shows ui for the page currently open
                "flex items-center gap-3 rounded-lg bg-lilac px-4 py-3 text-white"
              : // shows ui for an inactive navigation link
                "flex items-center gap-3 rounded-lg px-4 py-3 text-peri hover:bg-slate-800"
          }
        >
          <Settings />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
}
