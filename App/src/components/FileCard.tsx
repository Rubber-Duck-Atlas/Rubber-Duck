import { ExternalLink } from "lucide-react";
import React from "react";

export default function FileCard({ FileName }: { FileName: string }) {
  return (
    <div className="bg-slate-800 p-1 px-2 rounded-2xl flex justify-between" key={`doc-${FileName}`}>
      <div>
        <h1 className="font-bold">
          {FileName.replace(/\.[^/.]+$/, "")
            .replaceAll("-", " ")
            .replaceAll("_", " ")}
        </h1>
        <h2 className="text-xs">{FileName}</h2>
      </div>
      <div className="flex flex-col items-center">
        <div className="p-0.5 px-2 bg-lilac rounded-2xl text-xs">{FileName.match(/\.([^.]+)$/)?.[1] ?? ""}</div>
        <ExternalLink className="cursor-pointer p-0.5"/>
      </div>
    </div>
  );
}
