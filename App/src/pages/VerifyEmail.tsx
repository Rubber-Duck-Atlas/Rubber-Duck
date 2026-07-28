import React from "react";
import img from "../images/rumi.png";
import { Link } from "react-router-dom";

export default function VerifyEmail() {
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

        <p className="text-peri">A 6-digit code was sent to user@gmail.com</p>
      </div>

      {/* Verification code stuff */}
      <div className="flex flex-col">
        <label>6-digit code:</label>
        <input type="text" placeholder="Code" />

        <button className="bg-lilac text-ink">Verify</button>
      </div>

      <div className="flex flex-1 w-full">
        <button className="bg-lilac text-ink">Resend code</button>

        <Link to="/register" className="">
          Back to register
        </Link>
      </div>
    </main>
  );
}
