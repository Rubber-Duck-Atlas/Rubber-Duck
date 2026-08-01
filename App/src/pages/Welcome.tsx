import React from "react";
import { Link } from "react-router-dom";
import img from "../images/rumi.png";

export default function Welcome() {
  return (
    <main className="flex min-h-[72vh] w-full max-w-lg flex-col items-center text-center">
      {/* Top group */}
      <div className="flex flex-col items-center gap-6">
        <img
          className="w-24 h-24 object-contain drop-shadow-[0_0_14px_rgba(180,130,255,0.45)]"
          src={img}
          alt="A yellow rubber duck wearing a black graduation cap with a purple tassel"
        />

        <h1 className="text-4xl text-peri font-bold">
          Welcome to <span className="text-lilac">Rubber Duck</span>!
        </h1>

        <p className="max-w-md text-lg text-peri">
          Turn your documents into personalized study tools
        </p>
      </div>

      <div className="mt-auto flex w-full flex-col items-center gap-4">
        <p className="text-sm font-semibold tracking-widest text-peri">
          Upload. Search. Learn
        </p>

        <Link
          to="/onboarding"
          className="w-full max-w-xs rounded-xl bg-lilac px-8 py-3 text-center font-bold text-ink transition hover:opacity-90"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}
