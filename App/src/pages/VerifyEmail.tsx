import React from "react";
import img from "../images/rumi.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth, emailVerificationActionCodeSettings } from "../lib/firebase";
import { sendEmailVerification } from "firebase/auth";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email =
    (location.state as { email?: string } | null)?.email ??
    auth.currentUser?.email ??
    "your email address";

  const handleVerify = async () => {
    await auth.currentUser?.reload();

    if (auth.currentUser?.emailVerified) {
      navigate("/");
      return;
    }

    window.alert(
      "Please click the verification link in your email, then try again.",
    );
  };

  const handleResend = async () => {
    const user = auth.currentUser;

    if (!user) {
      window.alert("No signed-in user found.");
      return;
    }

    await sendEmailVerification(user, emailVerificationActionCodeSettings);
    window.alert("Verification email sent again.");
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
        <h1 className="text-2xl">Check your email!</h1>

        <p className="text-peri">A verification link was sent to </p>
        <p>
          <span className="text-lilac font-bold break-all">{email}</span>
        </p>

        {/* Verification link confirmation */}
        <div className="flex flex-col pt-4">
          <p className="pb-2">
            Open the email and click the verification link, then return here.
          </p>

          <button
            type="button"
            className="mx-auto w-full max-w-xs rounded-xl bg-lilac px-8 py-2 text-center font-bold text-ink transition hover:opacity-90 cursor-pointer"
            onClick={handleVerify}
          >
            I verified my email
          </button>
        </div>

        {/* Divider */}
        <div className="mt-4 h-px w-full bg-peri/40" />

        <div className="flex flex-col w-full">
          <button
            type="button"
            className="mx-auto w-full max-w-2xs rounded-xl bg-transparent p-2 text-center text-sm font-semibold text-peri/90 transition hover:opacity-90 cursor-pointer"
            onClick={handleResend}
          >
            Resend verification email
          </button>
        </div>

        <div className="mt-4">
          <p>Used the wrong email?</p>
          <Link to="/register" className="text-lilac transition hover:opacity-90 cursor-pointer">
            Back to register
          </Link>
        </div>
      </div>
    </main>
  );
}
