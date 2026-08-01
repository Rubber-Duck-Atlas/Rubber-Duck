import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

export default function Settings() {
  const navigate = useNavigate();
  const username = auth.currentUser?.displayName ?? "User Name";
  const email = auth.currentUser?.email ?? "user@email.com";

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <main className="flex w-full max-w-lg flex-col items-center text-center">
      {/* Header Section */}
      <div>
        <h1>Settings</h1>

        <p>Manage your account, storage, and app information.</p>
      </div>

      {/* Account Section */}
      <div className="mx-auto flex flex-col max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
        <section>
          <h2>Account</h2>

          <p>Name: {username}</p>
          <p>Email: {email}</p>

          <button className="bg-lilac text-ink">Change Password</button>

          <button className="bg-lilac text-ink" onClick={handleLogout}>Log Out</button>
        </section>
      </div>

      {/* Storage Section */}
      <div className="mx-auto flex flex-col max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
        <section>
          <h2>Storage</h2>

          <p>Storage Type: Local</p>
          <p>Folder: Rubber Duck app folder</p>
          <p>Uploaded files are stored locally on this device.</p>

          <p className="text-xs">Coming soon...</p>
          <button className="bg-lilac text-ink">Change File Location</button>
        </section>
      </div>

      {/* About Section */}
      <div className="mx-auto flex flex-col max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
        <section>
          <h2>About</h2>

          <p>App name: Rubber Duck</p>
          <p>
            Description: An AI study buddy that searches your uploaded documents
            and notes for relevant information.
          </p>
          <p>Version: Development Build 0.1.0</p>
        </section>
      </div>
    </main>
  );
}
