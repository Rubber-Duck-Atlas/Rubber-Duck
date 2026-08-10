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
import googleButton from "../images/google-logo.svg";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

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
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/invalid-email") {
          setError("Enter a valid email address.");
        } else if (
          error.code === "auth/invalid-credential" ||
          error.code === "auth/user-not-found" ||
          error.code === "auth/wrong-password"
        ) {
          setError("Incorrect email or password.");
        } else if (error.code === "auth/too-many-requests") {
          setError("Too many attempts. Please wait and try again.");
        } else if (error.code === "auth/network-request-failed") {
          setError("Check your internet connection and try again.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
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

        <p className="brand-font-fredoka text-peri text-3xl font-bold">
          Rubber Duck
        </p>
      </div>

      <div className="mx-auto flex flex-col max-w-sm items-center gap-2 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
        {/* Header Section */}
        <h1 className="text-2xl">Welcome Back!</h1>

        {/* Email Login */}
        <div className="flex flex-col w-full">
          <form
            className="flex flex-col text-peri w-full gap-4"
            onSubmit={handleLogin}
          >
            <label className="w-full border-b border-current">
              <input
                placeholder="Email"
                type="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full text-xl outline-none bg-transparent"
              ></input>
            </label>
            <div className="relative border-b border-current">
              <label htmlFor="login-password" className="sr-only">
                Password
              </label>

              <input
                id="login-password"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full bg-transparent pr-10 text-xl outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-peri transition hover:text-lilac focus-visible:outline-2 focus-visible:outline-lilac"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-red-400">
                {error}
              </p>
            )}

            {/* Log in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-xs cursor-pointer rounded-xl bg-lilac px-8 py-2 text-center font-bold text-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
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
            className="mx-auto h-10 w-full max-w-xs cursor-pointer overflow-hidden rounded-xl bg-[#F2F2F2] p-0 transition hover:opacity-90"
            type="button"
            onClick={handleGoogleLogin}
            aria-label="Sign in with Google"
          >
            <img
              src={googleButton}
              alt=""
              className="block h-full w-full object-fill"
            />
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
