import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import SettingsCard from "../components/SettingsCard";
import { auth } from "../lib/firebase";

export default function Settings() {
  const navigate = useNavigate();

  const username = auth.currentUser?.displayName ?? "User Name";
  const email = auth.currentUser?.email ?? "user@email.com";

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <main className="flex w-full flex-col items-center px-6 pb-4 pt-2 text-center">
      {/* Header Section */}
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-3xl font-bold">Settings</h1>

        <p>Manage your account, storage, and app information.</p>

        <div className="mt-4 h-px w-full bg-peri/40" />
      </div>

      <div className="mx-auto mt-4 flex w-full max-w-4xl flex-col gap-5">
        {/* Account Section */}
        <SettingsCard title="Account">
          <p>
            <span className="text-peri/60">Name: </span>
            <span className="font-semibold text-peri/90 [text-shadow:0_0_8px_rgba(180,130,255,0.55)]">
              {username}
            </span>
          </p>

          <p>
            <span className="text-peri/60">Email: </span>
            <span className="font-semibold text-peri/90 [text-shadow:0_0_8px_rgba(180,130,255,0.55)]">
              {email}
            </span>
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="mx-auto w-full max-w-xs cursor-pointer rounded-xl bg-lilac p-1.5 text-center text-ink transition hover:opacity-90"
          >
            Log Out
          </button>
        </SettingsCard>

        {/* Storage Section */}
        <SettingsCard title="Storage">
          <p>Storage Type: Local</p>
          <p>Folder: Rubber Duck app folder</p>
          <p>Uploaded files are stored locally on this device.</p>

          <div className="flex flex-col items-center gap-1">
            <p className="mx-auto text-xs">Coming soon...</p>

            <button
              type="button"
              className="mx-auto w-full max-w-xs cursor-not-allowed rounded-xl bg-lilac/50 p-1.5 text-center text-ink"
              disabled
            >
              Change File Location
            </button>
          </div>
        </SettingsCard>

        {/* About Section */}
        <SettingsCard title="About">
          <p>App name: Rubber Duck</p>

          <p>
            Description: An AI study buddy that searches your uploaded documents
            and notes for relevant information.
          </p>

          <p>Version: Development Build 0.1.0</p>
        </SettingsCard>
      </div>
    </main>
  );
}
