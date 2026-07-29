import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";
import Welcome from "./pages/Welcome";
import Onboarding from "./pages/Onboarding";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";

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

      <Route element={<AuthLayout />}>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verifyemail" element={<VerifyEmail />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
      </Route>

      {/* Catch unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>,
);
