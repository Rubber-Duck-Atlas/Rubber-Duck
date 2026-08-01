import React, { useState } from "react";
import img from "../images/rumi.png";
import { Link, useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, emailVerificationActionCodeSettings } from "../lib/firebase";
import { FirebaseError } from "firebase/app";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (!credential.user.emailVerified) {
        await sendEmailVerification(
          credential.user,
          emailVerificationActionCodeSettings,
        );
        navigate("/verifyemail", { state: { email } });
        return;
      }

      navigate("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to log in.";
      window.alert(message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate("/");
    } catch (error) {
      if (
        error instanceof FirebaseError &&
        (error.code === "auth/popup-closed-by-user" ||
          error.code === "auth/cancelled-popup-request")
      ) {
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : "Unable to sign in with Google.";
      window.alert(message);
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
        {/* Header Section */}
          <h1 className="text-2xl">Welcome Back!</h1>

        {/* Email Login */}
        <div className="flex flex-col w-full">
          <form className="flex flex-col text-peri w-full gap-4" onSubmit={handleLogin}>
            <label className="w-full border-b border-current">
              <input
                placeholder="Email"
                type="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full text-xl outline-none bg-transparent"
              ></input>
            </label>
            <label className="border-b border-current">
              <input
                placeholder="Password"
                type="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full text-xl outline-none bg-transparent"
              ></input>
            </label>

            <button className="w-full max-w-xs rounded-xl bg-lilac px-8 py-2 text-center font-bold text-ink transition hover:opacity-90">
              Login
            </button>
          </form>
        </div>

        {/* Forgot password link */}
        <div>
          <Link to="/forgotpassword" className="text-lilac">
            Forgot Password
          </Link>
        </div>

        {/* Divider Text */}
        <div className="w-full flex items-center justify-center gap-x-2">
          <div className="h-px flex-1 bg-current"></div>
          <p>OR</p>
          <div className="h-px flex-1 bg-current"></div>
        </div>

        {/* Google Login */}
        <div className="w-full">
          <button
            className="w-full max-w-xs rounded-xl bg-lilac px-8 py-2 text-center font-bold text-ink transition hover:opacity-90"
            type="button"
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </button>
        </div>

        {/* Login Link */}
        <div>
          <p>Don't have an account?</p>
          <Link to="/register" className="text-lilac">
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
}
