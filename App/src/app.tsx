import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import AppLayout from "./layouts/AppLayout";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

root.render(
  <BrowserRouter>
    <Routes>
      {/* Wraps routes with created layout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/Documents" element={<Documents />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>,
);
