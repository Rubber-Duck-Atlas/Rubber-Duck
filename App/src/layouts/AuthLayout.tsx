import React from "react";
import { Outlet } from "react-router-dom";

// gives onboarding and authentication pages a consistent full-screen layout
export default function AuthLayout() {
  return (
    <div className="auth-shell min-h-screen bg-ink text-peri">
      {/* Decorative shooting stars */}
      {/* flies left to right */}
      <div className="shooting-star shooting-star-one" aria-hidden="true" />
      {/* flies right to left */}
      <div className="shooting-star shooting-star-two" aria-hidden="true" />
      {/* flies diagonally upward */}
      <div className="shooting-star shooting-star-three" aria-hidden="true" />

      {/* Keeps every auth page above the background */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6">
        {/* Displays current page */}
        <Outlet />
      </div>
    </div>
  );
}
