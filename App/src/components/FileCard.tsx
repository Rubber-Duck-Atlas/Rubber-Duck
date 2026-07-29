import { Ellipsis, ExternalLink } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import FilePreview from "./FilePreview";

type FileCardProps = {
  FileName: string;
  isNote: boolean;
  onChange: (result: { documents: string[]; notes: string[] }) => void;
};

export default function FileCard({ FileName, isNote, onChange }: FileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleMove = async () => {
    const result = await window.api.moveFile(FileName, isNote);
    onChange(result);
    setMenuOpen(false);
  };

  const handleDelete = async () => {
    const result = await window.api.deleteFile(FileName, isNote);
    onChange(result);
    setMenuOpen(false);
  };

  const closePreview = () => {
    setPreviewOpen(false);
  };

  // Close the menu when clicking anywhere outside of it
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <>
      <div className="bg-slate-800 p-1 px-2 rounded-2xl flex justify-between" key={`doc-${FileName}`}>
        <div>
          <h1 className="font-bold">
            {FileName.replace(/\.[^/.]+$/, "")
              .replaceAll("-", " ")
              .replaceAll("_", " ")}
          </h1>
          <h2 className="text-xs">{FileName}<span className="ml-1 p-0.5 px-2 bg-lilac rounded-2xl text-xs">{FileName.match(/\.([^.]+)$/)?.[1] ?? ""}</span></h2>
        </div>
        <div className="flex flex-col items-center relative" ref={menuRef}>
          <Ellipsis
            className="cursor-pointer p-0.5"
            onClick={() => setMenuOpen((open) => !open)}
          />
          {menuOpen && (
            <div className="absolute right-0 top-6 z-10 w-48 bg-ink border border-peri rounded-xl shadow-lg overflow-hidden flex flex-col">
              <button
                type="button"
                className="text-left px-3 py-1.5 text-xs text-peri hover:bg-lilac hover:text-ink cursor-pointer"
                onClick={handleMove}
              >
                Move to {isNote ? "Documents" : "Notes"}
              </button>
              <button
                type="button"
                className="text-left px-3 py-1.5 text-xs text-peri hover:bg-lilac hover:text-ink cursor-pointer"
                onClick={handleDelete}
              >
                Remove
              </button>
            </div>
          )}
          <ExternalLink className="cursor-pointer p-0.5" onClick={() => setPreviewOpen(true)} />
        </div>
      </div>
      <FilePreview fileName={FileName} isNote={isNote} open={previewOpen} onClose={closePreview} />
    </>
  );
}
