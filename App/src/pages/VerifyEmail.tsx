import React, { useState } from "react";
import img from "../images/rumi.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth, emailVerificationActionCodeSettings } from "../lib/firebase";
import { sendEmailVerification } from "firebase/auth";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState("");
  const email = (location.state as { email?: string } | null)?.email ?? auth.currentUser?.email ?? "your email address";

  const handleVerify = async () => {
    await auth.currentUser?.reload();

    if (auth.currentUser?.emailVerified) {
      navigate("/");
      return;
    }

    window.alert("Please click the verification link in your email, then try again.");
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
      <div className="flex flex-1 w-full">
        <img
          className="w-12 h-12 object-contain"
          src={img}
          alt="A yellow rubber duck wearing a black graduation cap with a purple tassel"
        />

        <p className="text-lilac">Rubber Duck</p>
      </div>

      {/* Header Section */}
      <div>
        <h1 className="text-2xl">Check your email!</h1>

        <p className="text-peri">A 6-digit code was sent to {email}</p>
      </div>

      {/* Verification code stuff */}
      <div className="flex flex-col">
        <label>6-digit code:</label>
        <input type="text" placeholder="Code" onChange={(event) => setCode(event.target.value)} />

        <button className="bg-lilac text-ink" onClick={handleVerify}>
          Verify
        </button>
      </div>

      <div className="flex flex-1 w-full">
        <button className="bg-lilac text-ink" onClick={handleResend}>
          Resend code
        </button>

        <Link to="/register" className="">
          Back to register
        </Link>
      </div>
    </main>
  );
}
