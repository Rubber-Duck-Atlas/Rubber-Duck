import React from "react";

type SettingsCardProps = {
  title: string;
  children: React.ReactNode;
};

export default function SettingsCard({ title, children }: SettingsCardProps) {
  return (
    <section className="flex flex-col w-full gap-4 rounded-xl p-5 shadow-lg outline outline-lilac/35 text-peri bg-peri/10">
      <h2 className="text-left w-full text-xl font-semibold text-lilac">
        {title}
      </h2>

      <div className="flex flex-col w-full text-left items-stretch gap-3 rounded-xl p-5 outline outline-black/5 text-base font-medium text-peri/70 bg-peri/20">
        {children}
      </div>
    </section>
  );
}
