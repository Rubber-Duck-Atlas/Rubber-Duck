import React from "react";
import { Outlet } from "react-router-dom";

// gives onboarding and authentication pages a consistent full-screen layout
export default function AuthLayout() {
  return (
    // Gives a full screen height and puts everything in a central column layout with padding
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-ink text-peri">
      {/* Displays current page */}
      <Outlet />
    </div>
  );
}
