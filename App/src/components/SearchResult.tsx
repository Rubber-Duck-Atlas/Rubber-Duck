import { ExternalLink } from "lucide-react";
import React, { useState } from "react";
import FilePreview from "./FilePreview";

type SearchResultProps = {
  path: string;
  score: number;
  snippet: string;
  isNote: boolean;
};

export default function SearchResult({ path, score, snippet, isNote }: SearchResultProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileName = path.split(/[\\/]/).pop() ?? path;
  const displayName = fileName
    .replace(/\.[^/.]+$/, "")
    .replaceAll("-", " ")
    .replaceAll("_", " ");

  return (
    <>
      <div className="bg-slate-800 p-3 rounded-2xl flex flex-col gap-1 relative">
        <div className="flex justify-between items-center gap-2">
          <h2 className="font-bold truncate">{displayName}</h2>
          <span className="shrink-0 p-0.5 px-2 bg-lilac rounded-2xl text-xs text-ink font-bold">
            {score.toFixed(3)}
          </span>
        </div>
        <h3 className="text-xs">
          {fileName}
          <span className="ml-1 p-0.5 px-2 bg-lilac rounded-2xl text-xs">
            {fileName.match(/\.([^.]+)$/)?.[1] ?? ""}
          </span>
        </h3>
        <p className="text-xs text-peri/80 line-clamp-2 pr-8">{snippet}</p>
        <ExternalLink
          className="cursor-pointer p-0.5 absolute bottom-2 right-2"
          onClick={() => setPreviewOpen(true)}
        />
      </div>
      <FilePreview
        fileName={fileName}
        isNote={isNote}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
