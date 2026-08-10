import React from "react";
import { NavLink } from "react-router-dom";
import img from "../images/rumi.png";
import { Folder, Search, Settings, SquarePen } from "lucide-react";

// Shared sidebar navigation for main application pages
export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex h-screen w-12 flex-col overflow-hidden bg-slate-950 text-white transition-[width] duration-300 ease-out hover:w-36">

      <div className="flex w-full justify-center py-3">
        <NavLink to="/">
          <img
            src={img}
            alt="Rubber Duck logo"
            className="h-6 w-6 aspect-square object-contain"
          />
        </NavLink>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {/* Navigates to home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? // shows ui for the page currently open
                "flex items-center gap-3 rounded-lg bg-transparent px-3 py-3 text-lilac"
              : // shows ui for an inactive navigation link
                "flex items-center gap-3 rounded-lg bg-transparent px-3 py-3 text-peri hover:text-white"
          }
        >
          <span className="h-6 w-6 shrink-0">
            <Search className="h-full w-full aspect-square" />
          </span>
          <span className="whitespace-nowrap">
            Home
          </span>
        </NavLink>

        {/* Navigates to document library */}
        <NavLink
          to="/Documents"
          className={({ isActive }) =>
            isActive
              ? // shows ui for the page currently open
                "flex items-center gap-3 rounded-lg bg-transparent px-3 py-3 text-lilac"
              : // shows ui for an inactive navigation link
                "flex items-center gap-3 rounded-lg bg-transparent px-3 py-3 text-peri hover:text-white"
          }
        >
          <span className="h-6 w-6 shrink-0">
            <Folder className="h-full w-full aspect-square" />
          </span>
          <span className="whitespace-nowrap">
            Documents
          </span>
        </NavLink>

        {/* Navigates to text editor */}
        <NavLink
          to="/Editor"
          className={({ isActive }) =>
            isActive
              ? // shows ui for the page currently open
                "flex items-center gap-3 rounded-lg bg-transparent px-3 py-3 text-lilac"
              : // shows ui for an inactive navigation link
                "flex items-center gap-3 rounded-lg bg-transparent px-3 py-3 text-peri hover:text-white"
          }
        >
          <span className="h-6 w-6 shrink-0">
            <SquarePen className="h-full w-full aspect-square" />
          </span>
          <span className="whitespace-nowrap">
            Editor
          </span>
        </NavLink>

        {/* Navigates to settings */}
        <NavLink
          to="/Settings"
          className={({ isActive }) =>
            isActive
              ? // shows ui for the page currently open
                "mt-auto flex items-center gap-3 rounded-lg bg-transparent px-3 py-3 text-lilac"
              : // shows ui for an inactive navigation link
                "mt-auto flex items-center gap-3 rounded-lg bg-transparent px-3 py-3 text-peri hover:text-white"
          }
        >
          <span className="h-6 w-6 shrink-0">
            <Settings className="h-full w-full aspect-square" />
          </span>
          <span className="whitespace-nowrap">
            Settings
          </span>
        </NavLink>
      </nav>
    </aside>
  );
}
