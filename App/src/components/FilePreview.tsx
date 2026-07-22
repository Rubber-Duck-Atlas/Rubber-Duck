import { X } from "lucide-react";
import React, { useEffect, useState } from "react";

type FilePreviewProps = {
  fileName: string;
  isNote: boolean;
  open: boolean;
  onClose: () => void;
};

export default function FilePreview({ fileName, isNote, open, onClose }: FilePreviewProps) {
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const isHtml = /\.html?$/i.test(fileName);
  const isPdf = /\.pdf$/i.test(fileName);

  // Load the file's content whenever the preview is opened
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setPreviewLoading(true);
    setPreviewContent(null);
    setPreviewUrl(null);

    (async () => {
      try {
        const base64 = await window.api.readFileContent(fileName, isNote);
        if (cancelled) return;
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        if (isPdf) {
          const blob = new Blob([bytes], { type: "application/pdf" });
          setPreviewUrl(URL.createObjectURL(blob));
        } else {
          setPreviewContent(new TextDecoder("utf-8").decode(bytes));
        }
      } catch {
        if (!cancelled) setPreviewContent("Unable to open this file.");
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, fileName, isNote, isPdf]);

  // Revoke any outstanding preview blob URL when it changes or the component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-ink text-peri w-7/8 h-7/8 rounded-2xl border border-peri p-4 flex flex-col gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center gap-2">
          <h2 className="font-bold text-lg truncate">{fileName}</h2>
          <X className="cursor-pointer shrink-0" onClick={onClose} />
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
            <iframe title={fileName} srcDoc={previewContent ?? ""} className="w-full h-full bg-white" />
          ) : (
            <pre className="text-xs whitespace-pre-wrap p-2 h-full overflow-auto">{previewContent}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
