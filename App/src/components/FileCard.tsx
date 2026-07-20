import { Ellipsis, ExternalLink, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type FileCardProps = {
  FileName: string;
  isNote: boolean;
  onChange: (result: { documents: string[]; notes: string[] }) => void;
};

export default function FileCard({ FileName, isNote, onChange }: FileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const isHtml = /\.html?$/i.test(FileName);
  const isPdf = /\.pdf$/i.test(FileName);

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

  const handleOpen = async () => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    try {
      const base64 = await window.api.readFileContent(FileName, isNote);
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      if (isPdf) {
        const blob = new Blob([bytes], { type: "application/pdf" });
        setPreviewUrl(URL.createObjectURL(blob));
      } else {
        setPreviewContent(new TextDecoder("utf-8").decode(bytes));
      }
    } catch {
      setPreviewContent("Unable to open this file.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewContent(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  // Revoke any outstanding preview blob URL when the component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
          <ExternalLink className="cursor-pointer p-0.5" onClick={handleOpen} />
        </div>
      </div>
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={closePreview}
        >
          <div
            className="bg-ink text-peri w-7/8 h-7/8 rounded-2xl border border-peri p-4 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center gap-2">
              <h2 className="font-bold text-lg truncate">{FileName}</h2>
              <X className="cursor-pointer shrink-0" onClick={closePreview} />
            </div>
            <div className="flex-1 min-h-0 bg-slate-900 rounded-xl overflow-hidden">
              {previewLoading ? (
                <p className="text-sm p-2">Loading...</p>
              ) : isPdf ? (
                previewUrl ? (
                  <embed src={previewUrl} type="application/pdf" className="w-full h-full" />
                ) : (
                  <p className="text-sm p-2">Unable to open this file.</p>
                )
              ) : isHtml ? (
                <iframe title={FileName} srcDoc={previewContent ?? ""} className="w-full h-full bg-white" />
              ) : (
                <pre className="text-xs whitespace-pre-wrap p-2 h-full overflow-auto">{previewContent}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
