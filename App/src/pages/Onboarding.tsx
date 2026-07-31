import React, { useState } from "react";
import { Link } from "react-router-dom";
import img from "../images/rumi.png";
import uploadImg from "../images/upload-onboarding.svg";
import searchImg from "../images/search-onboarding.svg";
import learnImg from "../images/learn-onboarding.svg";

// lists info needed for each onboarding step
const onboardingSteps = [
  {
    id: 0,
    title: "Upload",
    description:
      "Use the upload button to import your textbooks, notes, and lessons.",
    src: uploadImg,
    alt: "Decorative image.",
  },
  {
    id: 1,
    title: "Search",
    description: "Search keywords to find relevant information.",
    src: searchImg,
    alt: "Decorative image.",
  },
  {
    id: 2,
    title: "Learn",
    description: "Learn with helpful quotes, sources, and page references.",
    src: learnImg,
    alt: "Decorative image.",
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);

  // moves screens forward 1 for each click
  function handleNext() {
    setIndex((i) => i + 1);
  }

  const currentStep = onboardingSteps[index];
  const isLastStep = index === onboardingSteps.length - 1;

  // checks whether the pagination dot belongs to the screen currently showing
  const listScreens = onboardingSteps.map((step) => {
    const isActive = step.id === index;

    return (
      <li
        key={step.id}
        className={
          isActive
            ? "h-3 w-6 rounded-full bg-lilac transition-all duration-300"
            : "h-3 w-3 rounded-full bg-peri opacity-40 transition-all duration-300"
        }
      />
    );
  });

  return (
    <main className="flex flex-col w-full min-h-[calc(100vh-3rem)] items-center text-center">
      {/* Top Section */}
      <div className="flex justify-between items-center w-full pb-2">
        {/* gives users the option to skip onboarding and go straight to create an account */}
        <Link to="/register" className="text-xl">
          Skip
        </Link>

        <img
          className="w-12 h-12 object-contain"
          src={img}
          alt="A yellow rubber duck wearing a black graduation cap with a purple tassel"
        />
      </div>

      <div className="flex flex-1 flex-col w-full items-center justify-center">
        {/* Image Section */}
        <div className="flex items-center justify-center max-w-lg w-full h-96 mb-6">
          {/* gives user a relevant graphic to whichever step they're on */}
          <img
            className="max-w-full max-h-full object-contain"
            src={currentStep.src}
            alt={currentStep.alt}
          />
        </div>

        {/* Middle Section */}
        <div className="max-w-lg w-full">
          <h1 className="text-2xl">{currentStep.title}</h1>

          <p>{currentStep.description}</p>
        </div>

        {/* Bottom Section */}
        <div className="max-w-lg w-full">
          {/* shows the pagination dots */}
          <ul className="my-6 flex items-center justify-center gap-2">
            {listScreens}
          </ul>

          {/* checks to see if user is on last step and shows corresponding button link */}
          {isLastStep ? (
            <Link
              to="/register"
              className="w-full max-w-xs rounded-xl bg-lilac px-8 py-3 inline-flex items-center justify-center text-center font-bold text-ink transition hover:opacity-90"
            >
              Create Account
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="w-full max-w-xs rounded-xl bg-lilac px-8 py-3 text-center font-bold text-ink transition hover:opacity-90"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
