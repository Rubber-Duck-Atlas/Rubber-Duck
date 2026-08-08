import React, { useState } from "react";
import img from "../images/rumi.png";
import { Link, useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, emailVerificationActionCodeSettings } from "../lib/firebase";
import { FirebaseError } from "firebase/app";
import googleButton from "../images/google-logo.svg";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (fullName) {
        await updateProfile(credential.user, { displayName: fullName });
      }

      await sendEmailVerification(
        credential.user,
        emailVerificationActionCodeSettings,
      );

      navigate("/verifyemail", { state: { email } });
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/email-already-in-use") {
          setError("An account already exists with this email.");
        } else if (error.code === "auth/invalid-email") {
          setError("Enter a valid email address.");
        } else if (error.code === "auth/weak-password") {
          setError("Password must be at least 6 characters.");
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

  const handleGoogleRegister = async () => {
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
        <h1 className="text-2xl">Create an Account</h1>

        {/* Email Registration */}
        <div className="flex flex-col w-full">
          <form
            className="flex flex-col text-peri w-full gap-4"
            onSubmit={handleRegister}
          >
            <label className="w-full border-b border-current">
              <input
                placeholder="Full Name"
                type="text"
                onChange={(event) => setFullName(event.target.value)}
                className="w-full text-xl outline-none bg-transparent"
              ></input>
            </label>
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
              <label htmlFor="register-password" className="sr-only">
                Password
              </label>

              <input
                id="register-password"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
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

            <p className="-mt-2 text-left text-xs text-slate-400">
              Password must be at least 6 characters.
            </p>

            <div className="relative border-b border-current">
              <label htmlFor="confirm-password" className="sr-only">
                Confirm password
              </label>

              <input
                id="confirm-password"
                placeholder="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={6}
                className="w-full bg-transparent pr-10 text-xl outline-none"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                aria-pressed={showConfirmPassword}
                className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-peri transition hover:text-lilac focus-visible:outline-2 focus-visible:outline-lilac"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-xs cursor-pointer rounded-xl bg-lilac px-8 py-2 text-center font-bold text-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        {/* Divider Text */}
        <div className="w-full flex items-center justify-center gap-x-2">
          <div className="h-px flex-1 bg-current"></div>
          <p>OR</p>
          <div className="h-px flex-1 bg-current"></div>
        </div>

        {/* Google Registration */}
        <div className="w-full">
          <button
            className="mx-auto h-10 w-full max-w-xs cursor-pointer overflow-hidden rounded-xl bg-[#F2F2F2] p-0 transition hover:opacity-90"
            type="button"
            onClick={handleGoogleRegister}
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
          <p>Already have an account?</p>
          <Link to="/login" className="text-lilac">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
