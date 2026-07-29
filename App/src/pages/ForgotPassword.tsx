import React from "react";
import img from "../images/rumi.png";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
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
      <div className="flex flex-col">
        <form>
          <label>
            Email:<input type="email"></input>
          </label>
        </form>
        <button className="bg-lilac text-ink">Send Reset Link</button>
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
