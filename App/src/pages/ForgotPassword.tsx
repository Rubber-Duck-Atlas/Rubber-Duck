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
      <div className="flex flex-1 w-full">
        <img
          className="w-12 h-12 object-contain"
          src={img}
          alt="A yellow rubber duck wearing a black graduation cap with a purple tassel"
        />

        <p className="text-lilac">Rubber Duck</p>
      </div>

      {/* Header Text */}
      <div>
        <h1>Forgot your password?</h1>

        <p>
          Enter the email connected to your account and we'll send you
          instructions to reset your password.
        </p>
      </div>

      {/* Email input */}
      <div className="mx-auto flex flex-col max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
        <form id="forgot-password-form" onSubmit={handleReset}>
          <label>
            Email:
            <input
              type="email"
              onChange={(event) => setEmail(event.target.value)}
              required
            ></input>
          </label>
        </form>
        <button className="bg-lilac text-ink" type="submit" form="forgot-password-form">
          Send Reset Link
        </button>
      </div>

      {/* Back to login button */}
      <div>
        <p>Remember your password?</p>
        <Link to="/login" className="">
          Back to Login
        </Link>
      </div>
    </main>
  );
}
