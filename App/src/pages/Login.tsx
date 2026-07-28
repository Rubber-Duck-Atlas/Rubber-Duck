import React from "react";
import img from "../images/rumi.png";
import { Link } from "react-router-dom";

export default function Login() {
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
        <h1 className="text-2xl">Welcome Back!</h1>

        <p className="text-lilac">Login to continue</p>
      </div>

      {/* Email Login */}
      <div className="flex flex-col">
        <form className="flex flex-col text-peri">
          <label>
            Email:<input type="email"></input>
          </label>
          <label>
            Password:<input type="password"></input>
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
        <button className="w-full max-w-xs rounded-xl bg-lilac px-8 py-3 text-center font-bold text-ink transition hover:opacity-90">
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
    </main>
  );
}
