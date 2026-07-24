import React from "react";
import img from "../images/rumi.png";
import { Link } from "react-router-dom";

export default function Register() {
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
        <h1 className="text-2xl">Create an Account</h1>

        <p className="text-lilac">Upload. Search. Learn</p>
      </div>

      {/* Email Registration */}
      <div className="flex flex-col">
        <form className="flex flex-col text-peri">
          <label>
            Full Name:<input type="text"></input>
          </label>
          <label>
            Email:<input type="email"></input>
          </label>
          <label>
            Password:<input type="password"></input>
          </label>
          <label>
            Confirm Password:<input type="password"></input>
          </label>

          <button className="w-full max-w-xs rounded-xl bg-lilac px-8 py-3 text-center font-bold text-ink transition hover:opacity-90">
            Create Account
          </button>
        </form>
      </div>

      {/* Divider Text */}
      <div>
        <p>----------------------------- OR -----------------------------</p>
      </div>

      {/* Google Registration */}
      <div>
        <button className="w-full max-w-xs rounded-xl bg-lilac px-8 py-3 text-center font-bold text-ink transition hover:opacity-90">
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
    </main>
  );
}
