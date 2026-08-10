import React, { useState } from "react";
import img from "../images/rumi.png";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await sendPasswordResetEmail(auth, email);
      window.alert("Password reset email sent.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send reset email.";
      window.alert(message);
      navigate("/login");
    }
  };

  return (
    <main className="flex w-full max-w-lg flex-col items-center text-center">
      {/* Top Section */}
      <div className="flex flex-1 gap-4 w-full justify-center items-center py-4">
        <img
          className="w-12 h-12 object-contain"
          src={img}
          alt="A yellow rubber duck wearing a black graduation cap with a purple tassel"
        />

        <h1 className="brand-font-fredoka text-peri text-3xl font-bold">
          Rubber Duck
        </h1>
      </div>

      <div className="mx-auto flex flex-col max-w-sm items-center gap-2 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
        {/* Header Text */}
        <h1 className="text-2xl">Forgot your password?</h1>

        <p>
          Enter the email connected to your account and we&apos;ll send you
          instructions to reset your password.
        </p>

        {/* Email input */}
        <div className="flex flex-col w-full">
          <form className="flex flex-col text-peri w-full gap-4" onSubmit={handleReset}>
            <label className="w-full border-b border-current">
              <input
                placeholder="Email"
                type="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full text-xl outline-none bg-transparent"
              ></input>
            </label>

            <button className="w-full max-w-xs rounded-xl bg-lilac px-8 py-2 text-center font-bold text-ink transition hover:opacity-90">
              Send Reset Link
            </button>
          </form>
        </div>

        {/* Back to login button */}
        <div>
          <p>Remember your password?</p>
          <Link to="/login" className="text-lilac">
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
