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

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      window.alert("Passwords do not match.");
      return;
    }

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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create account.";
      window.alert(message);
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
          <h1 className="text-2xl">Create an Account</h1>

          <p className="text-lilac">Upload. Search. Learn</p>
        </div>

        {/* Email Registration */}
        <div className="flex flex-col">
          <form className="flex flex-col text-peri" onSubmit={handleRegister}>
            <label>
              Full Name:
              <input
                type="text"
                onChange={(event) => setFullName(event.target.value)}
              ></input>
            </label>
            <label>
              Email:
              <input
                type="email"
                // value={email}
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
            <label>
              Confirm Password:
              <input
                type="password"
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              ></input>
            </label>

            <button className="w-full max-w-xs rounded-xl bg-lilac px-8 py-3 text-center font-bold text-ink transition hover:opacity-90">
              Create Account
            </button>
          </form>
        </div>

        {/* Divider Text */}
        <div>
          <p>---------------------------- OR ----------------------------</p>
        </div>

        {/* Google Registration */}
        <div>
          <button
            className="w-full max-w-xs rounded-xl bg-lilac px-8 py-3 text-center font-bold text-ink transition hover:opacity-90"
            type="button"
            onClick={handleGoogleRegister}
          >
            Continue with Google
          </button>
        </div>

        {/* Storage Note Text */}
        <div>
          <p className="text-xs">
            Your uploaded files will be stored locally on this device in Rubber
            Duck's app folder. Cloud storage may be added in a future update.
          </p>
        </div>

        {/* Login Link */}
        <div>
          <p>Already have an account?</p>
          <Link to="/login" className="">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
