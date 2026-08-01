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

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);

      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user, emailVerificationActionCodeSettings);
        navigate("/verifyemail", { state: { email } });
        return;
      }

      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to log in.";
      window.alert(message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in with Google.";
      window.alert(message);
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

      <div className="mx-auto flex flex-col max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl">Welcome Back!</h1>

          <p className="text-lilac">Login to continue</p>
        </div>

        {/* Email Login */}
        <div className="flex flex-col">
          <form className="flex flex-col text-peri" onSubmit={handleLogin}>
            <label>
              Email:
              <input
                type="email"
                onChange={(event) => setEmail(event.target.value)}
                required
              ></input>
            </label>
            <label>
              Password:
              <input
                type="password"
                onChange={(event) => setPassword(event.target.value)}
                required
              ></input>
            </label>

            <button className="w-full max-w-xs rounded-xl bg-lilac px-8 py-3 text-center font-bold text-ink transition hover:opacity-90">
              Login
            </button>
          </form>
        </div>

        {/* Forgot password link */}
        <div>
          <Link to="/forgotpassword" className="">
            Forgot Password
          </Link>
        </div>

        {/* Divider Text */}
        <div>
          <p>----------------------------- OR -----------------------------</p>
        </div>

        {/* Google Login */}
        <div>
          <button
            className="w-full max-w-xs rounded-xl bg-lilac px-8 py-3 text-center font-bold text-ink transition hover:opacity-90"
            type="button"
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </button>
        </div>

        {/* Login Link */}
        <div>
          <p>Don't have an account?</p>
          <Link to="/register" className="">
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
}
