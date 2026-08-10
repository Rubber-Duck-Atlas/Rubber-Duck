import React from "react";

export default function TextFade({ text, className }: { text: string, className: string }) {
  return (
    <h1 className={className}>
      <span>
        {text.split("").map((char, i) => (
          <span
            key={i}
            className="inline-block animate-fade-up opacity-0"
            style={{
              animationDelay: `${i * 10}ms`,
              animationFillMode: "forwards",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    </h1>
  );
}
